import hashlib
import re
import spacy
import pymongo
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from gmail_auth import get_authenticated_email, load_existing_token
import concurrent.futures

# Load spaCy NLP model for NER
nlp = spacy.load("en_core_web_sm")

# Authenticate Gmail API
service = load_existing_token()
user_email = get_authenticated_email(service)
user_name = user_email.split("@")[0]

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
db = mongo_client["User-Activity-Analysis"]
collection = db[user_name]

# Load NLP model
nlp = spacy.load("en_core_web_sm")
stop_words = set(stopwords.words("english"))
lemmatizer = WordNetLemmatizer()
job_postings_set = set()  # Store unique job posting hashes

def preprocess_text(text):
    if not text: return "", []

    text = re.sub(r"https?://\S+", "", text)  # Remove URLs
    text = re.sub(r"<[^>]+>", "", text)  # Remove email addresses
    text = re.sub(r"[^\w\s]", "", text).strip()  # Remove special characters except spaces

    # Named Entity Recognition (NER) for company names & locations
    doc = nlp(text)
    entities_names = [ent.text for ent in doc.ents if ent.label_ in ["ORG", "GPE", "LOC"]]

    text = text.lower()  # Convert to lowercase

    # Deduplication using MD5 hash
    text_hash = hashlib.md5(text.encode()).hexdigest()
    if text_hash in job_postings_set:
        return "", []  # Duplicate detected
    job_postings_set.add(text_hash)

    # Tokenization, Stopword Removal & Lemmatization
    words = [lemmatizer.lemmatize(word) for word in word_tokenize(text) if word not in stop_words]

    return " ".join(words), entities_names

def preprocess_sender(sender):
    if not sender: return ""

    #Extract name if available (text before <email>)
    match = re.search(r'^(.*?)\s*<.*?>$', sender)
    if match: sender_name = match.group(1).strip()
    else: sender_name = sender  # If no <> found, assume the whole string is an email
    sender_name = sender_name.strip("\"'")  # Removes " and '

    #If name is empty or looks like an email, extract from the domain
    if not sender_name or "@" in sender_name:
        match = re.search(r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})', sender)
        if match:
            domain_parts = match.group(2).split('.')
            if len(domain_parts) > 1: sender_name = " ".join(domain_parts[-2:]).title()
            else: sender_name = domain_parts[0].title()
    return sender_name


def process_emails():
    for email in collection.find():
        email_id = email["_id"]
        subject = email.get("subject", "")
        body = email.get("body", "")
        sender = email.get("from", "")

        # Preprocess subject & body
        pool = concurrent.futures.ThreadPoolExecutor(max_workers=3)

        future_subject = pool.submit(preprocess_text, subject)
        processed_subject, subject_entities = future_subject.result()
        future_subject = pool.submit(preprocess_text, body)
        processed_body, body_entities = future_subject.result()
        future_subject = pool.submit(preprocess_sender, sender)
        processed_sender = future_subject.result()

        pool.shutdown(wait=True)
        if processed_body == "": processed_body = processed_subject

        # Update database with cleaned text and extracted entities
        collection.update_one(
            {"_id": email_id},
            {"$set": {
                "subject": processed_subject,
                "body": processed_body,
                "from": processed_sender,
                "Entities_names": list(set(subject_entities + body_entities))
            }}
        )

if __name__ == "__main__":
    process_emails()
    print("✅ Preprocessing complete! Data updated in MongoDB.")