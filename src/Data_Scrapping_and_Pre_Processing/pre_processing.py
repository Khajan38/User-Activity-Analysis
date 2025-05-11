import re
import os
import nltk
import spacy
import pymongo
import hashlib
import concurrent
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup
from functools import lru_cache

#NLTK Environment Setup
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
nltk_data_path = ROOT_DIR / "dependencies" / "nltk_data"
if not os.path.exists(nltk_data_path): os.makedirs(nltk_data_path)
os.environ['NLTK_DATA'] = str(nltk_data_path)
nltk.data.path.clear()
nltk.data.path.append(str(nltk_data_path))

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet

# Load NLP model
job_postings_set = set()
URL_PATTERN = re.compile(r"https?://\S+")
EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
nlp = spacy.load("en_core_web_sm")
stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()
@lru_cache(maxsize=5000)
def cached_lemmatize(word):
    return lemmatizer.lemmatize(word)

# Pre-processing for data-frame emails (Model Training)
def preprocess_dataFrame(text):
    if not text:
        return ""
    text = re.sub(r"https?://\S+", "", text)
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text).strip()
    words = [
        cached_lemmatize(word)
        for word in word_tokenize(text)
        if word not in stop_words
    ]
    return " ".join(words)

def preprocess_text(text):
    if not text: return "", []

    text = URL_PATTERN.sub("", text)  # Remove URLs
    soup = BeautifulSoup(text, "html.parser") # Parse HTML content (to handle embedded styles, scripts)
    text = soup.get_text()  # Extract text without HTML tags
    emails_found = EMAIL_PATTERN.findall(text) # Extract all raw emails from text
    text = EMAIL_PATTERN.sub("", text) # Remove email addresses
    text = re.sub(r"[\r\n\t]+", " ", text)  # Replace control characters with space
    text = re.sub(r"\s+", " ", text).strip()  # Normalize whitespaces
    # Temporarily protect date and time expressions
    text = re.sub(r"(?<=\d):(?=\d{2})", "__COLON__", text)
    text = re.sub(r"\b\d{2,4}/\d{1,2}/\d{2,4}\b", lambda m: m.group().replace("/", "__SLASH__"), text)
    text = re.sub(r"\b\d{2,4}-\d{1,2}-\d{2,4}\b", lambda m: m.group().replace("-", "__SLASH__"), text)
    text = re.sub(r"[^\w\s]", " ", text) # Remove all special characters
    text = text.replace("__COLON__", ":") # Restore colons in time expressions
    text = text.replace("__SLASH__", "/") # Restore slash in time expressions

    # Named Entity Recognition (NER) for company names & locations
    doc = nlp(text)
    entities_names = [ent.text for ent in doc.ents if ent.label_ in ["ORG", "GPE", "LOC", "PERSON"]]
    junk_prefixes = {"noreply", "no-reply", "nodomain", "support", "admin", "info", "contact", "help", "notifications"}
    useful_emails = [
        email for email in emails_found
        if email.split("@")[0].lower() not in junk_prefixes
    ]
    entities_names += [email.split("@")[0] for email in useful_emails]

    # Deduplication using MD5 hash
    text = text.lower()
    text_hash = hashlib.md5(text.encode()).hexdigest()
    if text_hash in job_postings_set: return "", []
    job_postings_set.add(text_hash)

    # Tokenization,Stopword Removal & Lemmatization
    words = [lemmatizer.lemmatize(word) for word in word_tokenize(text) if word not in stop_words]
    return " ".join(words), entities_names

def preprocess_sender(sender):
    if not sender: return ""

    # Extract name if available (text before <email>)
    match = re.search(r'^(.*?)\s*<.*?>$', sender)
    if match: sender_name = match.group(1).strip()
    else: sender_name = sender  # If no <> found, assume the whole string is an email
    sender_name = sender_name.strip("\"'")  # Removes " and '

    # If name is empty or looks like an email, extract from the domain
    if not sender_name or "@" in sender_name:
        match = re.search(r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})', sender)
        if match:
            domain_parts = match.group(2).split('.')
            if len(domain_parts) > 1: sender_name = " ".join(domain_parts[-2:]).title()
            else: sender_name = domain_parts[0].title()
    return sender_name

def preprocess_datetime(dt_string):
    dt_string = re.sub(r"\s\([A-Za-z]+\)$", "", dt_string)
    formats = ["%a, %d %b %Y %H:%M:%S %z","%d %b %Y %H:%M:%S %z"]
    for fmt in formats:
        try: return datetime.strptime(dt_string, fmt)
        except ValueError: continue
    return None

# Pre-processing for Project's Actual Emails
def process_emails(collection, batch_size = 100):
    wordnet.ensure_loaded()
    bulk_operations = []

    for email in collection.find():
        email_id = email["_id"]
        subject = email.get("subject", "")
        body = email.get("body", "")
        sender = email.get("from", "")
        dt_string = email.get("date-time")

        #Multi-Threading
        with concurrent.futures.ThreadPoolExecutor(max_workers=min(4, os.cpu_count() or 1)) as pool:
            f1 = pool.submit(preprocess_text, subject)
            f2 = pool.submit(preprocess_text, body)
            f3 = pool.submit(preprocess_sender, sender)
            f4 = pool.submit(preprocess_datetime, dt_string)
            processed_subject, subject_entities = f1.result()
            processed_body, body_entities = f2.result()
            processed_sender = f3.result()
            processed_dt = f4.result()
            pool.shutdown(wait=True)

        if processed_body == "":
            collection.delete_one({"_id": email_id})
            continue

        update_operation = pymongo.UpdateOne(
            {"_id": email_id},
            {"$set": {
                "subject": processed_subject,
                "body": processed_body,
                "from": processed_sender,
                "Entities_names": list(set(subject_entities + body_entities + [processed_sender])),
                "date-time": processed_dt
            }}
        )
        bulk_operations.append(update_operation)
        if len(bulk_operations) >= batch_size:
            collection.bulk_write(bulk_operations)
            bulk_operations.clear()
    if bulk_operations: collection.bulk_write(bulk_operations)