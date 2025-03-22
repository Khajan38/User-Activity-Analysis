import pymongo
import pickle
from src.Data_Scrapping_and_Pre_Processing.gmail_auth import get_authenticated_email, load_existing_token

# Authenticate Gmail API
service = load_existing_token()
user_email = get_authenticated_email(service)
user_name = user_email.split("@")[0]

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
db = mongo_client["User-Activity-Analysis"]
collection = db[user_name]

# Load the trained model and vectorizer
with open("../../dependencies/naive_bayes_model.pkl", "rb") as model_file:
    classifier = pickle.load(model_file)

with open("../../dependencies/vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

def classify_emails():
    emails = list(collection.find({"category": {"$exists": False}}))  # Fetch unclassified emails
    for email in emails:
        email_id = email["_id"]
        text = email.get("subject", "") + " " + email.get("body", "")
        # Convert text to vector
        text_vector = vectorizer.transform([text])
        # Predict category
        predicted_category = classifier.predict(text_vector)[0]
        # Update MongoDB with the predicted category
        collection.update_one(
            {"_id": email_id},
            {"$set": {"category": predicted_category}}
        )
    print("✅ Email classification complete! Data updated in MongoDB.")

if __name__ == "__main__":
    classify_emails()