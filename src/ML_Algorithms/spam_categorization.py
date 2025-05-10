import os
import pickle
import pymongo
from dotenv import load_dotenv
from src.Data_Scrapping_and_Pre_Processing.gmail_auth import get_authenticated_email, load_existing_token

# Authenticate Gmail API
service = load_existing_token()
user_email = get_authenticated_email(service)
user_name = user_email.split("@")[0]

# Connect to MongoDB
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
mongo_client = pymongo.MongoClient(mongo_uri)
db = mongo_client["User-Activity-Analysis"]
collection = db[user_name]

# Load the trained model and vectorizer
with open("../../dependencies/spam_NB.pkl", "rb") as model_file:
    classifier = pickle.load(model_file)
with open("../../dependencies/spam_vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

def classify_emails():
    emails = list(collection.find({"spam_category": {"$exists": False}}))
    print("Categorizing", len(emails), "emails...")
    for email in emails:
        email_id = email["_id"]
        text = email.get("subject", "") + " " + email.get("body", "")
        text_vector = vectorizer.transform([text]).toarray()
        predicted_category = classifier.predict(text_vector)[0]
        collection.update_one(
            {"_id": email_id},
            {"$set": {"spam_category": predicted_category}}
        )
    print("✅ Email classification complete! Data updated in MongoDB.")

if __name__ == "__main__":
    classify_emails()