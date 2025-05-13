import os
import time
import threading
import subprocess
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.exceptions import GoogleAuthError

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]
TOKEN_DIR = "data/tokens"
CREDENTIALS_PATH = "credentials.json"
os.makedirs(TOKEN_DIR, exist_ok=True)

class OAuthTimeoutError(Exception):
    pass

def get_authenticated_email(service):
    profile = service.users().getProfile(userId="me").execute()
    return profile["emailAddress"]

def kill_process_on_port(port):
    try:
        cmd = f'netstat -ano | findstr :{port}'
        result = subprocess.check_output(cmd, shell=True).decode()
        lines = result.strip().split('\n')
        for line in lines:
            parts = line.strip().split()
            pid = parts[-1]
            cmd_check = f'tasklist /FI "PID eq {pid}" /V'
            task_result = subprocess.check_output(cmd_check, shell=True).decode()
            if 'run_local_server' in task_result.lower():
                os.system(f'taskkill /PID {pid} /F')
                print(f"✅ Killed OAuth process {pid} on port {port}")
                return
        print(f"⚠️ No OAuth process found on port {port}")
    except Exception as e:
        print(f"⚠️ Could not kill process on port {port}: {e}")


def run_flow_with_timeout(flow, timeout=30, port=8080, max_retries=2):
    creds_container = {}
    def run_flow():
        try: creds_container["creds"] = flow.run_local_server(port=port, prompt="consent")
        except OSError as e: creds_container["error"] = str(e)
    for attempt in range(max_retries):
        thread = threading.Thread(target=run_flow)
        thread.start()
        thread.join(timeout)
        if thread.is_alive():
            print("❌ Timeout: Login window took too long.")
            raise OAuthTimeoutError("Login timed out or user closed the popup.")
        if "error" in creds_container:
            kill_process_on_port(8080)
            if "WinError 10048" in creds_container["error"]:
                print(f"⚠️ Port {port} is already in use. Retrying in 3 seconds...")
                time.sleep(3)
                continue
            else: raise GoogleAuthError(f"OAuth error: {creds_container['error']}")
        return creds_container.get("creds", None)
    raise (GoogleAuthError(f"OAuth error: Port {port} is not available after retries."))

def load_existing_token():
    flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
    try:
        creds = run_flow_with_timeout(flow, timeout=30)
        if creds is None: raise OAuthTimeoutError("Login cancelled or credentials not received.")
        service = build("gmail", "v1", credentials=creds)
        email = get_authenticated_email(service)
        token_path = os.path.join(TOKEN_DIR, f"token_{email}.json")
        with open(token_path, "w") as token_file:
            token_file.write(creds.to_json())
            print(f"✅ Token saved for {email}!")
        return service
    except OAuthTimeoutError as e:
        print(f"❌ Login failed or cancelled: {e}")
        return None
    except GoogleAuthError as e:
        print(f"❌ Authentication error: {e}")
        return None