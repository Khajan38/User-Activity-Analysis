import os
import nltk
import pymongo
from pathlib import Path
from dotenv import load_dotenv
from nltk.sentiment import SentimentIntensityAnalyzer
from src.Data_Scrapping_and_Pre_Processing.gmail_auth import get_authenticated_email, load_existing_token

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
nltk_data_path = ROOT_DIR / "dependencies" / "nltk_data"
if not os.path.exists(nltk_data_path): os.makedirs(nltk_data_path)
os.environ['NLTK_DATA'] = str(nltk_data_path)
nltk.data.path.clear()
nltk.data.path.append(str(nltk_data_path))
print(nltk.data.path)

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

sia = SentimentIntensityAnalyzer()
emails = collection.find({"sentiment": {"$exists": False}})

for email in emails:
    text = email.get("body", "")
    sentiment_scores = sia.polarity_scores(text)
    compound_score = sentiment_scores['compound']
    if compound_score >= 0.05:
        sentiment_label = "positive"
    elif compound_score <= -0.05:
        sentiment_label = "negative"
    else:
        sentiment_label = "neutral"
    collection.update_one(
        {"_id": email["_id"]},
        {"$set": {"sentiment": sentiment_label, "sentiment_scores": sentiment_scores}}
    )

print("Sentiment analysis completed and updated in MongoDB.")