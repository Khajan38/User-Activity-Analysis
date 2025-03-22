from nltk.sentiment import SentimentIntensityAnalyzer
import pymongo
from src.Data_Scrapping_and_Pre_Processing.gmail_auth import get_authenticated_email, load_existing_token

# Authenticate Gmail API
service = load_existing_token()
user_email = get_authenticated_email(service)
user_name = user_email.split("@")[0]

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
db = mongo_client["User-Activity-Analysis"]
collection = db[user_name]

# Initialize VADER sentiment analyzer
sia = SentimentIntensityAnalyzer()

# Fetch emails that have not been analyzed yet
emails = collection.find({"sentiment": {"$exists": False}})

for email in emails:
    text = email.get("body", "")  # Extract email body

    # Get sentiment scores
    sentiment_scores = sia.polarity_scores(text)

    # Classify sentiment based on compound score
    compound_score = sentiment_scores['compound']
    if compound_score >= 0.05:
        sentiment_label = "positive"
    elif compound_score <= -0.05:
        sentiment_label = "negative"
    else:
        sentiment_label = "neutral"

    # Update the email document with sentiment info
    collection.update_one(
        {"_id": email["_id"]},
        {"$set": {"sentiment": sentiment_label, "sentiment_scores": sentiment_scores}}
    )

print("Sentiment analysis completed and updated in MongoDB.")