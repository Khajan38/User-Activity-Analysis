from bson import ObjectId
from datetime import timedelta
from bson.json_util import dumps
from src.user_context import user_context
from flask import Blueprint, request, jsonify

meetings_bp = Blueprint('meetings', __name__)
meetings = []

def setMeetings():
    global meetings
    meetings.clear()
    collections = [user_context['collectionM'], user_context['collectionC']]
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
    global meetings
    if not meetings: setMeetings()
    return dumps(meetings)

@meetings_bp.route("/meetings", methods=["POST"])
def save_meeting():
    collection = user_context['collectionC']
    data = request.get_json()
    data["_id"] = ObjectId(data["id"])
    del data["id"]
    collection.insert_one(data)
    return jsonify({"message": "Meeting saved"}), 201