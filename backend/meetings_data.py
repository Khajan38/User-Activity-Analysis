import os
import pymongo
from flask import Blueprint
from datetime import timedelta
from dotenv import load_dotenv
from bson.json_util import dumps

meetings_bp = Blueprint('meetings', __name__)
meetings = []

def setMeetings():
    global meetings
    user_name = "tanujbhatt8279"
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")
    mongo_client = pymongo.MongoClient(mongo_uri)
    db = mongo_client["User-Activity-Analysis"]
    collection = db["Meetings_" + user_name]
    meetings = list(collection.find())
    for i, meeting in enumerate(meetings):
        original_date = meeting.get("date-time")
        del meeting["date-time"]
        del meeting["_id"]
        meeting["id"] = i
        if original_date:
            meeting['date'] = original_date.date().isoformat()
            start_time = original_date.time().replace(microsecond=0).strftime('%H:%M')
            meeting['startTime'] = start_time
            end_time_object = (original_date + timedelta(hours=1)).time().replace(microsecond=0)
            meeting['endTime'] = end_time_object.strftime('%H:%M')

@meetings_bp.route('/meetings', methods=['GET'])
def get_meetings():
    global meetings
    if not meetings: setMeetings()
    return dumps(meetings)