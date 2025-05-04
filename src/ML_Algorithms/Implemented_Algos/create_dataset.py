import pandas as pd
import random

meeting_emails = [ #1000
    "The quarterly review meeting is scheduled for 9 AM Monday. Please be on time.",
    "Meeting scheduled for 2 PM. Don’t forget to bring the financial report.",
    "We are organizing a lunch meeting at 12 PM tomorrow. See you there."
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
print(f"CSV file created with {len(meeting_emails) + len(non_meeting_emails)} entries!")