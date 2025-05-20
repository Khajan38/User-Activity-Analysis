# Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import pickle

# Load the trained model and vectorizer
with open("dependencies/meetings_NB.pkl", "rb") as model_file:
    classifier = pickle.load(model_file)
with open("dependencies/meetings_vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

def classify_emails(collection):
    emails = list(collection.find({"meeting_category": {"$exists": False}}))
    print("Categorizing", len(emails), "emails...")
    y_score, index = {}, classifier.classMap["meeting"]
    for email in emails:
        email_id = email["_id"]
        text = email.get("subject", "") + " " + email.get("body", "")
        text_vector = vectorizer.transform([text]).toarray()
        predicted_category = classifier.predict(text_vector)[0]
        if predicted_category == "non-meeting": y_score[email_id] = classifier.getPredictedScores()[0][index]
        collection.update_one(
            {"_id": email_id},
            {"$set": {"meeting_category": predicted_category}}
        )
    print("✅ Email classification complete! Data updated in MongoDB.")
    return y_score