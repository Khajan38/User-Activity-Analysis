#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

from bson import ObjectId
from datetime import timedelta
from bson.json_util import dumps
from flask import Blueprint, request, jsonify

username = None
meetings_bp = Blueprint('meetings', __name__)
meetings = []

def setMeetings():
    global meetings
    meetings.clear()
    from src.user_context_manager import load_user_context
    user_context = load_user_context()
    #SetUp MongoDB
    from dotenv import load_dotenv
    import pymongo
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri: raise ValueError("MONGO_URI not set in environment variables")
    mongo_client = pymongo.MongoClient(mongo_uri)
    db = mongo_client["User-Activity-Analysis"]
    collections = [db[user_context['collectionM']], db[user_context['collectionC']]]
    for collection in collections:
        for meeting in collection.find():
            original_date = meeting.get("date-time")
            meeting.pop("date-time", None)
            start_exists = "startTime" in meeting
            end_exists = "endTime" in meeting
            meeting["_id"] = str(meeting["_id"])
            if original_date and not start_exists and not end_exists:
                meeting['date'] = original_date.date().isoformat()
                meeting['startTime'] = original_date.time().replace(microsecond=0).strftime('%H:%M')
                meeting['endTime'] = (original_date + timedelta(hours=1)).time().replace(microsecond=0).strftime(
                    '%H:%M')
            meetings.append(meeting)

@meetings_bp.route('/meetings', methods=['GET'])
def get_meetings():
    from src.user_context_manager import load_user_context
    user_context = load_user_context()
    global meetings, username
    if not meetings or username != user_context['user_name']:
        print("Called get_meeting's setMeetings")
        setMeetings()
        username = user_context['user_name']
    print("Called get_meeting", len(meetings))
    return dumps(meetings)

@meetings_bp.route("/meetings", methods=["POST"])
def save_meeting():
    from src.user_context_manager import load_user_context
    user_context = load_user_context()
    # SetUp MongoDBy
    from dotenv import load_dotenv
    import pymongo
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri: raise ValueError("MONGO_URI not set in environment variables")
    mongo_client = pymongo.MongoClient(mongo_uri)
    db = mongo_client["User-Activity-Analysis"]
    collection = db[user_context['collectionC']]
    data = request.get_json()
    _id = ObjectId()
    data["_id"] = _id
    del data["id"]
    collection.insert_one(data)
    print("Called save_meeting's setMeetings")
    setMeetings()
    return jsonify({"_id": str(_id)}), 201