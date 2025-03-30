import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"] #Define API scope (Read-only access)

# Paths for credentials and token storage
TOKEN_DIR = "../../data/tokens"
CREDENTIALS_PATH = "../../data/credentials.json"
os.makedirs(TOKEN_DIR, exist_ok=True)

def get_authenticated_email(service):
    profile = service.users().getProfile(userId="me").execute()
    return profile["emailAddress"]

def authenticate_gmail():
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

def load_existing_token():
    token_files = [f for f in os.listdir(TOKEN_DIR) if f.startswith("token_")]
    if not token_files:
        print("⚠️ No existing tokens found. Proceeding with authentication.")
        return authenticate_gmail()

    print("\n🔹 Available accounts:")
    for i, file in enumerate(token_files, start=1):
        print(f"{i}. {file.replace('token_', '').replace('.json', '')}")
    choice = input("\nSelect an account by number or press Enter for a new login: ")
    print()

    if choice.isdigit() and 1 <= int(choice) <= len(token_files):
        selected_token = token_files[int(choice) - 1]
        token_path = os.path.join(TOKEN_DIR, selected_token)
        try:
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
            if creds and creds.valid:
                print(f"✅ Using existing token for {selected_token.replace('token_', '').replace('.json', '')}")
                return build("gmail", "v1", credentials=creds)
        except Exception as e:
            print(f"⚠️ Error loading {selected_token}: {e}. Re-authenticating...")

    return authenticate_gmail()

if __name__ == "__main__":
    print(f"🔍 Looking for stored tokens in {TOKEN_DIR}...")
    service = load_existing_token()
    if service:
        print("✅ Gmail API authentication successful!")
    else:
        print("❌ Gmail API authentication unsuccessful!")
