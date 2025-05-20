#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import os
import nltk
from pathlib import Path
from nltk.sentiment import SentimentIntensityAnalyzer

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
nltk_data_path = ROOT_DIR / "dependencies" / "nltk_data"
if not os.path.exists(nltk_data_path): os.makedirs(nltk_data_path)
os.environ['NLTK_DATA'] = str(nltk_data_path)
nltk.data.path.clear()
nltk.data.path.append(str(nltk_data_path))
sia = SentimentIntensityAnalyzer()

def sentimentAnalysis(collection):
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