#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

from flask import Blueprint, jsonify
from src.UI_Requirements.spam_Flask import get_spam_data
from src.UI_Requirements.meeting_Flask import get_meetings_data
from src.UI_Requirements.data_Flask import get_dashboard_data

spam_classifier= Blueprint('spam_classifier', __name__)

user_name = None
spam_data = None
meetings_data = None
overview_data = None

@spam_classifier.route("/spam_classifier", methods=["GET"])
def spam_categorization():
    global spam_data
    if spam_data is None: spam_data = get_spam_data()
    return jsonify(spam_data)

@spam_classifier.route("/meetings_classifier", methods=["GET"])
def  meetings_categorization():
    global meetings_data
    if meetings_data is None: meetings_data = get_meetings_data()
    return jsonify(meetings_data)

@spam_classifier.route("/overview_dashboard", methods=["GET"])
def  overview_details():
    global user_name, overview_data
    from src.user_context_manager import load_user_context
    user_context = load_user_context()
    if overview_data is None or user_name != user_context['user_name']:
        overview_data = get_dashboard_data()
        user_name = user_context['user_name']
    return jsonify(overview_data)