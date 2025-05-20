import pandas as pd
import random

meeting_emails = [
    "hello well discussing system performance backend refactor plan time 5:00 pm ist date wednesday may 8th google meet best tanuj system architect",
    "team meeting quarterly review budget discussion time 10:30 am est date friday may 10th zoom link regards sarah financial director",
    "invitation product roadmap planning session time 2:00 pm pst date monday may 13th microsoft teams thanks david product manager",
]

non_meeting_emails = [ #740
    "Get ready for our holiday sale! Discounts on all items throughout December.",
    "Join us for our upcoming webinar on data science! Register now.",
    "New updates have been posted on the company website. Check out the blog for more information."
]

data = []
for _ in range(len(meeting_emails)):
    data.append({"category": "meeting", "text": meeting_emails[_ % len(meeting_emails)]})
for _ in range(len(non_meeting_emails)):
    data.append({"category": "non-meeting", "text": non_meeting_emails[_ % len(non_meeting_emails)]})
random.shuffle(data)
df = pd.DataFrame(data)
csv_file_path = '../../../dependencies/meetings_dataset.csv'
df.to_csv(csv_file_path, mode='a', header=not pd.io.common.file_exists(csv_file_path), index=False)
print(f"CSV file appended with {len(meeting_emails) + len(non_meeting_emails)} entries!")