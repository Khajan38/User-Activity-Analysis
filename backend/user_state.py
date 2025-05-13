#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

from flask import Blueprint, jsonify
from backend.setup import initializeAPI

service, user_name, user_email = None, None, None
login_bp = Blueprint('login', __name__)
logout_bp = Blueprint('logout', __name__)
refresh_bp = Blueprint('refresh', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    global service, user_name, user_email
    print(f"\n🟢 User initiated the request...")
    from src.Data_Scrapping_and_Pre_Processing.gmail_auth import get_authenticated_email, load_existing_token
    service = load_existing_token()
    if service is None:
        return jsonify({'error': 'Login failed or cancelled.'}), 401  # 401 = Unauthorized
    try:
        user_email = get_authenticated_email(service)
        user_name = user_email.split("@")[0]
        initializeAPI(user_name, user_email)
        from dotenv import load_dotenv
        import pymongo
        load_dotenv()
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri: raise ValueError("MONGO_URI not set in environment variables")
        mongo_client = pymongo.MongoClient(mongo_uri)
        db = mongo_client["User-Activity-Analysis"]
        collection = db[user_name]
        collectionM = db["Meetings_" + user_name]
        collectionC = db[f"Meetings_{user_name}_Calendar"]
        tempCollection = db[f"{user_name}_temp"]

        from src.Pipeline import Pipeline
        obj = Pipeline(service, collection, collectionM, collectionC, tempCollection)
        obj.pipeline()
        return jsonify({'email': user_email}), 200
    except Exception as e:
        print(f"❌ Exception during login process: {e}")
        return jsonify({'error': 'Login succeeded but internal error occurred.', 'details': str(e)}), 500

@logout_bp.route('/logout', methods=['POST'])
def logout():
    user_email = "example@gmail.com"
    initializeAPI()
    return jsonify({'email': user_email}), 200

@refresh_bp.route('/refresh', methods=['POST'])
def refresh():
    global service, user_name, user_email
    from src.Pipeline import Pipeline
    from dotenv import load_dotenv
    import pymongo
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri: raise ValueError("MONGO_URI not set in environment variables")
    mongo_client = pymongo.MongoClient(mongo_uri)
    db = mongo_client["User-Activity-Analysis"]
    collection = db[user_name]
    collectionM = db[f"Meetings_{user_name}"]
    collectionC = db[f"Meetings_{user_name}_Calendar"]
    tempCollection = db[f"{user_name}_temp"]
    obj = Pipeline(service, collection, collectionM, collectionC, tempCollection)
    obj.pipeline()
    return jsonify({'message': 'Token refreshed (placeholder).'}), 200