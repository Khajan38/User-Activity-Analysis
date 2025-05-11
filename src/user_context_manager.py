#Root Directory in System Path
import sys, os, json
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

CONTEXT_PATH = os.path.abspath(f'{root_path}/dependencies/user_context.json')

def load_user_context():
    with open(CONTEXT_PATH, 'r') as f:
        return json.load(f)

def save_user_context(updated_context):
    with open(CONTEXT_PATH, 'w') as f:
        json.dump(updated_context, f, indent=4)

def update_user_context(**kwargs):
    context = load_user_context()
    context.update(kwargs)
    save_user_context(context)