from datetime import datetime
from dateparser.search import search_dates
from concurrent.futures import ThreadPoolExecutor

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

def processMeetingEmails(collection, collectionM):
    emails = collection.find({"meeting_category": "meeting"})
    result = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        result = list(executor.map(extractData, emails))
    if result:
        print(f"✅ Inserting extracted meeting data into database...")
        collectionM.delete_many({})
        collectionM.insert_many(result)