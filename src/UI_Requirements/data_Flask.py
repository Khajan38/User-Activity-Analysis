#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import pymongo
import pandas as pd
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor
from src.user_context_manager import load_user_context
from src.ML_Algorithms.burnout_predictor import predict_burnout_range, predict_burnout_for_today

load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri: raise ValueError("MONGO_URI not set in environment variables")
mongo_client = pymongo.MongoClient(mongo_uri)
db = mongo_client["User-Activity-Analysis"]

def get_dashboard_data():
    user_name = load_user_context()["user_name"]
    collection = db[user_name]
    collectionM = db["Meetings_" + user_name]
    collectionC = db["Meetings_" + user_name + "_Calendar"]
    def count_total_emails():
        return collection.count_documents({})

    def count_ham_emails():
        return collection.count_documents({"spam_category": "ham"})

    def count_meeting_emails():
        return collectionM.count_documents({})

    def count_calendar_meetings():
        return collectionC.count_documents({})

    def sentiment_counts():
        return {
            "Positive": collection.count_documents({"sentiment": "positive"}),
            "Negative": collection.count_documents({"sentiment": "negative"}),
            "Neutral": collection.count_documents({"sentiment": "neutral"})
        }

    def burnout_prediction():
        return predict_burnout_for_today(collection, collectionM, collectionC)

    def burnout_range_prediction():
        return predict_burnout_range(collection, collectionM, collectionC)

    def get_top_senders():
        emails = pd.DataFrame(list(collection.find({}, {"from": 1, "_id": 0})))
        top_senders = emails['from'].value_counts().head(10)
        return top_senders.to_dict()

    print("Inside the Dashboard Getter function...")
    with ThreadPoolExecutor() as executor:
        f_total_emails = executor.submit(count_total_emails)
        f_ham_emails = executor.submit(count_ham_emails)
        f_meeting_emails = executor.submit(count_meeting_emails)
        f_calendar_meetings = executor.submit(count_calendar_meetings)
        f_sentiments = executor.submit(sentiment_counts)
        f_burnout = executor.submit(burnout_prediction)
        f_burnout_range = executor.submit(burnout_range_prediction)
        f_top_senders = executor.submit(get_top_senders)

        total_emails = f_total_emails.result()
        ham_emails = f_ham_emails.result()
        meeting_emails = f_meeting_emails.result()
        calendar_meetings = f_calendar_meetings.result()
        sentiment_details = f_sentiments.result()
        predictionsToday, burnout= f_burnout.result()
        burnout_range = f_burnout_range.result()
        top_senders = f_top_senders.result()

    return {
        "total_emails": total_emails,
        "spam_categories": {
            "ham": ham_emails,
            "spam": total_emails - ham_emails
        },
        "meeting_categories": {
            "meeting": meeting_emails,
            "non-meeting": total_emails - meeting_emails
        },
        "total_meetings": meeting_emails + calendar_meetings,
        "sentiment_details": sentiment_details,
        "burnout": burnout,
        "burnout_range": burnout_range,
        "top_senders": top_senders,
        "predictionsToday": predictionsToday
    }