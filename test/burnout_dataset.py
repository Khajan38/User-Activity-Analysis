# Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)
import random
import csv

def generate_sample():
    total_emails = random.randint(3, 30)
    total_meetings = random.randint(0, min(total_emails, 10))
    night_emails = random.randint(0, min(total_emails, 10))
    negative_sentiment_ratio = round(random.uniform(0.0, 0.3), 3)
    urgent_meeting_count = random.choices([0, 1, 2], weights=[0.7, 0.25, 0.05])[0]
    avg_urgency_score = round(random.uniform(0.0, 2.0), 2)

    # Simple burnout rule-based logic:
    burnout_score = (
            0.25 * total_emails +
            0.35 * total_meetings +
            0.5 * night_emails +
            12.0 * negative_sentiment_ratio +
            1.0 * urgent_meeting_count +
            0.8 * avg_urgency_score
    )

    burnout = 1 if burnout_score > 6.5 else 0

    return [
        total_emails, total_meetings, night_emails,
        negative_sentiment_ratio, urgent_meeting_count,
        avg_urgency_score, burnout
    ]


# Generate dataset
with open("dependencies/burnout_dataset.csv", mode="w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow([
        "total_emails", "total_meetings", "night_emails",
        "negative_sentiment_ratio", "urgent_meeting_count",
        "avg_urgency_score", "burnout"
    ])
    for _ in range(500):
        writer.writerow(generate_sample())