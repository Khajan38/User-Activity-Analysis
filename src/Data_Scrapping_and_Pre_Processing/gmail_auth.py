import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Define API scope (Read-only access)
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

# Paths for credentials and token storage
TOKEN_DIR = "../../data/tokens"  # Directory to store multiple tokens
CREDENTIALS_PATH = "../../data/credentials.json"

# Ensure the token directory exists
os.makedirs(TOKEN_DIR, exist_ok=True)

def get_authenticated_email(service):
    """Fetches the authenticated user's email address."""
    profile = service.users().getProfile(userId="me").execute()
    return profile["emailAddress"]

def authenticate_gmail():
    print("🔐 Please select the Gmail account you want to use.")

    creds = None
    token_path = None  # Will be set after email selection

    # Perform authentication
    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
    creds = flow.run_local_server(port=8080, prompt="consent")

    # Get the authenticated email
    service = build("gmail", "v1", credentials=creds)
    email = get_authenticated_email(service)

    # Define the token path for this specific email
    token_path = os.path.join(TOKEN_DIR, f"token_{email}.json")

    # Save token for future use
    with open(token_path, "w") as token_file:
        token_file.write(creds.to_json())
        print(f"✅ Token saved for {email}!")

    return service

def load_existing_token():
    """Loads an existing token if available."""
    # Get list of stored tokens
    token_files = [f for f in os.listdir(TOKEN_DIR) if f.startswith("token_")]

    if not token_files:
        print("⚠️ No existing tokens found. Proceeding with authentication.")
        return authenticate_gmail()

    # Display available accounts
    print("\n🔹 Available accounts:")
    for i, file in enumerate(token_files, start=1):
        print(f"{i}. {file.replace('token_', '').replace('.json', '')}")

    # Prompt user for account selection
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

    # If selection failed, perform new authentication
    return authenticate_gmail()

if __name__ == "__main__":
    print(f"🔍 Looking for stored tokens in {TOKEN_DIR}...")
    service = load_existing_token()
    if service:
        print("✅ Gmail API authentication successful!")
    else:
        print("❌ Gmail API authentication unsuccessful!")
