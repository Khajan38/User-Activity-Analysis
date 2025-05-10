import os
import pymongo
import pandas as pd
import seaborn as sns
import ipywidgets as widgets
from dotenv import load_dotenv
import matplotlib.pyplot as plt
from IPython.display import display
from src.Data_Scrapping_and_Pre_Processing.gmail_auth import get_authenticated_email, load_existing_token
from model_dashboard import plotDataset

# Authenticate Gmail API
service = load_existing_token()
user_email = get_authenticated_email(service)
user_name = user_email.split("@")[0]

# Connect to MongoDB
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
mongo_client = pymongo.MongoClient(mongo_uri)
db = mongo_client["User-Activity-Analysis"]
collection = db[user_name]

emails = pd.DataFrame(list(collection.find({}, {"_id": 0, "from": 1, "spam_category": 1,  "meeting_category": 1, "sentiment": 1})))
emails['spam_category'] = emails['spam_category'].fillna('Unknown')
emails['meeting_category'] = emails['meeting_category'].fillna('Unknown')
emails['sentiment'] = emails['sentiment'].fillna('Neutral')
total_emails = len(emails)

# 📊 Plot Top 10 Email Senders
def plot_top_senders():
    plt.figure(figsize=(8, 4))
    top_senders = emails['from'].value_counts().head(10)
    sns.barplot(y=top_senders.index, x=top_senders.values)
    plt.title("Top 10 Email Senders")
    plt.xlabel("Email Count")
    plt.ylabel("Sender")
    plt.show()

# 📈 Sentiment Distribution Plot
def plot_sentiment_distribution():
    plt.figure(figsize=(8, 4))
    sns.countplot(y=emails['sentiment'], order=emails['sentiment'].value_counts().index, hue=emails['sentiment'], palette="coolwarm", legend=False)
    plt.title("Sentiment Analysis of Emails")
    plt.xlabel("Count")
    plt.ylabel("Sentiment")
    plt.show()

# 🚀 Display Dashboard
print(f"📩 Total Emails Fetched: {total_emails}")
if 'spam_category' in emails.columns:
    display(widgets.Label("📊 Email Distribution: Spam Category"))
    plotDataset(emails["spam_category"], user_name)
else:
    print("⚠️ 'spam_category' column missing.")

if 'meeting_category' in emails.columns:
    display(widgets.Label("📊 Email Distribution: Meeting Category"))
    plotDataset(emails["meeting_category"], user_name)
else:
    print("⚠️ 'meeting_category' column missing.")

display(widgets.Label("📬 Top 10 Email Senders:"))

plot_top_senders()

display(widgets.Label("📈 Sentiment Analysis of Emails:"))
plot_sentiment_distribution()