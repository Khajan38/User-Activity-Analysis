#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

from flask import Blueprint, jsonify
from src.UI_Requirements.spam_Flask import get_spam_data
from src.UI_Requirements.meeting_Flask import get_meetings_data
spam_classifier= Blueprint('spam_classifier', __name__)

spam_data = None
meetings_data = None

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