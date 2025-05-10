import pymongo
from datetime import datetime, timedelta
from src.Data_Scrapping_and_Pre_Processing.gmail_auth import get_authenticated_email, load_existing_token

# Authenticate Gmail API
service = load_existing_token()
user_email = get_authenticated_email(service)
user_name = user_email.split("@")[0]

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb+srv://khajan_bhatt:Tanuj%4024042005@khajan38.9iqi4n1.mongodb.net/")
db = mongo_client["User-Activity-Analysis"]
collection = db[user_name]
collectionM = db["Meetings_" + user_name]

class Burnout_Features :
    def __init__ (self, year, month, day):
        self.start_date = datetime(year, month, day, 0, 0, 0)
        self.end_date = self.start_date + timedelta(days=1) - timedelta(seconds=1)
        self.emails = []

    def setup(self):
        emails = collection.find({"spam_category": "ham", "date-time": {"$gte": self.start_date, "$lte": self.end_date}})
        self.emails = list(emails)

    def total_emails_received(self):
        return len(self.emails)

    def total_meetings(self):
        email_count = collectionM.count_documents({
            "date-time": {
                "$gte": self.start_date,
                "$lte": self.end_date
            }
        })
        return email_count

    def negative_sentiment_ratio(self):
        if not self.emails: return 0
        negative_emails = sum(email['sentiment_scores']['compound'] < -0.05 for email in self.emails)
        return negative_emails / len(self.emails)

    def night_emails(self):
        cur_time = self.start_date + timedelta(hours=20)
        email_count = 0
        for email in self.emails:
            if email["date-time"] > cur_time : email_count += 1
        return email_count