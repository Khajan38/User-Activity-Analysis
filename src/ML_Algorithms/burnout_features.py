# Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

class Burnout_Features:
    def __init__(self, year, month, day, collection, collectionM, collectionC):
        self.start_date = datetime(year, month, day, 0, 0, 0)
        self.end_date = self.start_date + timedelta(days=1) - timedelta(seconds=1)
        self.collection = collection
        self.collectionM = collectionM
        self.collectionC = collectionC
        self.emails = []
        self.meeting_emails = []
        self.meetingCal = []

    def setup(self):
        self.emails = list(self.collection.find({"spam_category": "ham", "date-time": {"$gte": self.start_date, "$lte": self.end_date},}))
        self.meeting_emails = list(self.collectionM.find({"date-time": {"$gte": self.start_date, "$lte": self.end_date}}))
        self.meetingCal = list(self.collectionC.find({"date-time": {"$gte": self.start_date, "$lte": self.end_date}}))

    def total_emails_received(self):
        return len(self.emails)

    def total_meetings(self):
        return len(self.meeting_emails) + len(self.meetingCal)

    def negative_sentiment_ratio(self):
        if not self.emails and not self.meetingCal:return 0
        negative = sum(email["sentiment_scores"]["compound"] < -0.05 for email in self.emails) + sum(email["sentiment_scores"]["compound"] < -0.05 for email in self.meetingCal)
        return negative / (len(self.emails) + len(self.meetingCal))

    def night_emails(self):
        cut_off = self.start_date + timedelta(hours=20)  # after 8 p.m.
        return sum(email["date-time"] > cut_off for email in self.emails)

    def urgency_meetings(self):
        color_weights = {"red": 5, "orange": 3, "blue": 2, "green": 1}
        total_weight, urgent_count, total = 0, 0, 0
        for meeting in self.meeting_emails + self.meetingCal:
            color = meeting.get("color", "green")
            total_weight += color_weights.get(color, 0)
            total += 1
            if color in {"red", "orange"}:
                urgent_count += 1
        avg_score = total_weight / total if total else 0
        return {"urgent_meeting_count": urgent_count, "avg_urgency_score": avg_score}

def compute_burnout_for_day(offset, collection, collectionM, collectionC):
    target = datetime.now() - timedelta(days=offset)
    b = Burnout_Features(target.year, target.month, target.day, collection, collectionM, collectionC)
    b.setup()
    urgency = b.urgency_meetings()
    return {
        "date": target.strftime("%Y-%m-%d"),
        "total_emails": b.total_emails_received(),
        "total_meetings": b.total_meetings(),
        "night_emails": b.night_emails(),
        "negative_sentiment_ratio": b.negative_sentiment_ratio(),
        "urgent_meeting_count": urgency["urgent_meeting_count"],
        "avg_urgency_score": round(urgency["avg_urgency_score"], 2),
    }

def burnoutFeaturesRange(collection, collectionM, collectionC, days=30, threads=5):
    results = []
    with ThreadPoolExecutor(max_workers=threads) as pool:
        futures = [pool.submit(compute_burnout_for_day, d, collection, collectionM, collectionC) for d in range(days)]
        for fut in as_completed(futures):
            results.append(fut.result())
    results.sort(key=lambda r: r["date"], reverse=True)
    return results