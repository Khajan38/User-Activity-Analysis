import pymongo
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import ipywidgets as widgets
from IPython.display import display
from src.Data_Scrapping.gmail_auth import get_authenticated_email, load_existing_token

# Authenticate Gmail API
service = load_existing_token()
user_email = get_authenticated_email(service)
user_name = user_email.split("@")[0]

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
db = mongo_client["User-Activity-Analysis"]
collection = db[user_name]

# Fetch emails from MongoDB
emails = pd.DataFrame(list(collection.find({}, {"_id": 0, "from": 1, "labelIds": 1})))

# Flatten label IDs for easier processing
emails['label'] = emails['labelIds'].apply(lambda x: ', '.join(x) if isinstance(x, list) else 'Unknown')

# Total emails count
total_emails = len(emails)

def plot_email_distribution():
    plt.figure(figsize=(8, 4))
    sns.countplot(y=emails['label'], order=emails['label'].value_counts().index)
    plt.title("Email Count by Labels")
    plt.xlabel("Count")
    plt.ylabel("Label")
    plt.show()

def plot_top_senders():
    top_senders = emails['from'].value_counts().head(10)
    plt.figure(figsize=(8, 4))
    sns.barplot(y=top_senders.index, x=top_senders.values)
    plt.title("Top 10 Email Senders")
    plt.xlabel("Email Count")
    plt.ylabel("Sender")
    plt.show()

# Widgets for dashboard
print(f"📩 Total Emails Fetched: {total_emails}")
display(widgets.Label("Email Distribution by Labels:"))
plot_email_distribution()

display(widgets.Label("Top 10 Senders:"))
plot_top_senders()
