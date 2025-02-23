from gmail_auth import authenticate_gmail  # Import authentication function

def get_emails(service, max_results=5):
    results = service.users().messages().list(userId="me", maxResults=max_results).execute()
    messages = results.get("messages", [])

    if not messages:
        print("📭 No emails found.")
        return

    for msg in messages:
        msg_data = service.users().messages().get(userId="me", id=msg["id"]).execute()
        headers = msg_data["payload"]["headers"]

        subject = next((h["value"] for h in headers if h["name"] == "Subject"), "No Subject")
        sender = next((h["value"] for h in headers if h["name"] == "From"), "Unknown Sender")

        print(f"📧 Email from: {sender}\n   Subject: {subject}\n")

if __name__ == "__main__":
    service = authenticate_gmail()
    print("✅ Gmail API authentication successful!\nFetching emails...\n")
    get_emails(service)