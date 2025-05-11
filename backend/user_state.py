from flask import Blueprint, jsonify
from backend.setup import initializeAPI

login_bp = Blueprint('login', __name__)
logout_bp = Blueprint('logout', __name__)
refresh_bp = Blueprint('refresh', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    print("Hello inside login")
    from src.Data_Scrapping_and_Pre_Processing.fetchEmail import get_authenticated_email, load_existing_token
    service = load_existing_token()
    user_email = get_authenticated_email(service)
    user_name = user_email.split("@")[0]
    initializeAPI(user_name, user_email)
    return jsonify({'email': user_email}), 200

@logout_bp.route('/logout', methods=['POST'])
def logout():
    user_email = "example@gmail.com"
    initializeAPI()
    return jsonify({'email': user_email}), 200

@refresh_bp.route('/refresh', methods=['POST'])
def refresh():
    return jsonify({'message': 'Token refreshed (placeholder).'}), 200