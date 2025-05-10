from dateparser.search import search_dates
from datetime import datetime
import pymongo
from concurrent.futures import ThreadPoolExecutor
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


def extractData(email):
    subject = email.get("subject", "").strip()
    body = email.get("body", "").strip()
    tags = email.get("Entities_names", [])
    email_datetime = email["date-time"]

    if not subject: subject = "Meeting"
    subject = subject + " : " + email.get("sender", "Unknown")

    urgency_keywords = ['urgent', 'asap', 'important', 'critical', 'immediate', 'priority']
    urgency_keywords_count = sum(keyword.lower() in (subject + body).lower() for keyword in urgency_keywords)
    if urgency_keywords_count >= 3: color = "red"
    elif urgency_keywords_count == 2: color = "orange"
    elif urgency_keywords_count == 1: color = "blue"
    else: color = "green"

    date_search = search_dates(
        body,
        settings={
            'PREFER_DATES_FROM': 'future',
            'RELATIVE_BASE': email_datetime,
            'DATE_ORDER': 'DMY'
        }
    )

    extracted_date = email_datetime
    if date_search: extracted_date = date_search[0][1]
    if isinstance(extracted_date, str): extracted_date = datetime.fromisoformat(extracted_date)

    return {
        'title': subject,
        'description': body,
        'date-time': extracted_date,
        'attendees': tags,
        'color': color
    }

def processMeetingEmails():
    emails = collection.find({"meeting_category": "meeting"})
    print(f"🗑️ Cleared temp storage for Meetings_{user_name}\n\t\t\t⌛ Processing...")
    result = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        result = list(executor.map(extractData, emails))
    if result:
        print(f"✅ Inserting extracted meeting data into database...")
        collectionM.delete_many({})
        collectionM.insert_many(result)

if __name__ == "__main__":
    processMeetingEmails()