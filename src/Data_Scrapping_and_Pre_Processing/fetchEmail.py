#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import time
import base64
import datetime
from bs4 import BeautifulSoup
from src.user_context_manager import load_user_context
user_context = load_user_context()
user_name = user_context['user_name']

# Define date range (last 90 days)
days_back = 90
date_from = (datetime.datetime.now() - datetime.timedelta(days=days_back)).strftime("%Y/%m/%d")
query = f"after:{date_from}"

def batch_fetch_email_details(msg_ids, service):
    batch = service.new_batch_http_request()
    email_data_list = []
    def callback(request_id, response, exception):
        if exception is None:
            data = extract_email_data(response)
            if data != {}: email_data_list.append(data)
    for msg_id in msg_ids:
        batch.add(service.users().messages().get(userId="me", id=msg_id), callback=callback)
    batch.execute()
    time.sleep(0.5)
    return email_data_list

def extract_email_data(email_data):
    headers = email_data.get("payload", {}).get("headers", [])
    def get_header_value(header_name):
        return next((h["value"] for h in headers if h["name"].lower() == header_name.lower()), None)
    sender = get_header_value("From") or "Unknown"
    subject = get_header_value("Subject") or "No Subject"
    date = get_header_value("Date") or "Unknown Date"
    def extract_body(payload):
        if "parts" in payload:
            for part in payload["parts"]:
                if part.get("mimeType") == "text/plain" and "data" in part.get("body", {}):
                    return base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="ignore")
                elif part.get("mimeType") == "text/html" and "data" in part.get("body", {}):
                    html_content = base64.urlsafe_b64decode(part["body"]["data"]).decode("utf-8", errors="ignore")
                    return BeautifulSoup(html_content, "html.parser").get_text()
        elif "body" in payload and "data" in payload["body"]:
            return base64.urlsafe_b64decode(payload["body"]["data"]).decode("utf-8", errors="ignore")
        return ""
    body = extract_body(email_data.get("payload", {})).strip()
    if body == "": return {}
    return {
        "id": email_data.get("id"),
        "from": sender,
        "subject": subject,
        "date-time": date,
        "body": body
    }

MAX_RETRIES = 3
def fetch_emails(service, collection, temp_collection):
    print(f"📩 Fetching emails from the last {days_back} days...")
    total_emails = 0
    next_page_token = None
    if(temp_collection != None): temp_collection.delete_many({})  # Clear temp collection
    print(f"🗑️ Cleared temp storage for {user_name}\n\t\t\t⌛ Processing...")
    while True:
        for attempt in range(MAX_RETRIES):
            try:
                response = service.users().messages().list(userId="me", q=query, pageToken=next_page_token).execute()
                break  # Exit retry loop if successful
            except Exception as e:
                print(f"⚠️ Error fetching messages, retrying ({attempt + 1}/{MAX_RETRIES})...")
                time.sleep(2 ** attempt)  # Exponential backoff
        if response is None:
            print("❌ Failed to fetch messages after multiple retries. Aborting...")
            break
        messages = response.get("messages", [])
        if not messages: break
        msg_ids = [msg["id"] for msg in messages]
        email_data_list = batch_fetch_email_details(msg_ids, service)
        if email_data_list:
            temp_collection.insert_many(email_data_list)
            total_emails += len(email_data_list)
        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break
    collection.drop()
    temp_collection.rename(user_name)
    print(f"🚀 Done! {total_emails} emails fetched and stored in MongoDB.")