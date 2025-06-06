# Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import re
from concurrent.futures import ThreadPoolExecutor
# from src.UI_Requirements.model_dashboard import plot_meeting_scores
from src.ML_Algorithms.meeting_categorization import classify_emails

collection = None

def is_meeting_rule_based(text):
    keywords = [
        "meeting", "agenda", "status update", "review", "discussion", "sync",
        "invite", "interview", "planning", "session", "standup", "1:1", "one-on-one",
        "check-in", "checkin", "kickoff", "kick-off", "scrum", "demo", "retrospective",
        "briefing", "touch base", "follow-up", "alignment", "town hall", "conference",
        "webinar", "roundtable", "review call", "huddle", "catch up", "consultation",
        "presentation", "collaboration", "onboarding", "workshop"
    ]
    time_patterns = [
        r"\b\d{1,2}:\d{2}\s?(am|pm|AM|PM)?\b",  # 4:30, 23:23, 4:30pm
        r"\b\d{1,2}\s?(am|pm|AM|PM)\b",  # 4 PM, 8am
        r"\b(mon|tue|wed|thu|fri)(day)?\b",  # Days
        r"\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b",  # 2025-05-08, 2025/5/8
        r"\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b" # 08-05-25, 8/5/2025
    ]
    location_keywords = [
        "zoom", "google meet", "teams", "skype", "webex", "slack", "meet", "hangouts",
        "room", "conference room", "meeting room", "center", "lab", "office", "boardroom",
        "auditorium", "hall", "training room", "via", "location", "venue", "link", "online",
        "virtual", "call", "video call", "video conference", "deadline"
    ]

    has_keyword = any(k in text for k in keywords)
    has_time = any(re.search(p, text) for p in time_patterns)
    has_location = any(l in text for l in location_keywords)

    match_count = sum([has_keyword, has_time, has_location])
    return match_count

def process_email(y_score):
    global collection
    email_id, prob = y_score
    text = collection.find_one({"_id": email_id}, {"body": 1}).get("body")
    heuristics = is_meeting_rule_based(text)
    if heuristics == 3 or (heuristics == 2 and prob >= 0.3):
        collection.update_one({'_id': email_id}, {'$set': {'meeting_category': 'meeting'}})
        return 1
    return 0

def hybrid_predict(collectionA):
    global collection
    collection = collectionA
    y_scores = classify_emails(collection)  #Run ML classifier
    # plot_meeting_scores(y_scores, 0.3)
    results = 0
    with ThreadPoolExecutor(max_workers=10) as executor: #Apply rule-based heuristics using multithreading
        results  = sum(executor.map(process_email, y_scores.items()))
    print(f"Categorizing using Heuristics {len(y_scores)} emails -> {results} changed...")
    print(f"✅ Email classification complete! Data updated in MongoDB.")