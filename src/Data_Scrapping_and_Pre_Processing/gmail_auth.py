import os
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"] #Define API scope (Read-only access)

# Paths for credentials and token storage
TOKEN_DIR = "data/tokens"
CREDENTIALS_PATH = "data/credentials.json"
os.makedirs(TOKEN_DIR, exist_ok=True)

def get_authenticated_email(service):
    profile = service.users().getProfile(userId="me").execute()
    return profile["emailAddress"]

def load_existing_token():
    print("🔐 Please select the Gmail account you want to use.")
    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
    creds = flow.run_local_server(port=8080, prompt="consent")
    service = build("gmail", "v1", credentials=creds)
    email = get_authenticated_email(service)
    token_path = os.path.join(TOKEN_DIR, f"token_{email}.json")
    with open(token_path, "w") as token_file:
        token_file.write(creds.to_json())
        print(f"✅ Token saved for {email}!")
    return service