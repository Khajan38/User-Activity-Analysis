import pymongo
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import ipywidgets as widgets
from IPython.display import display
from src.Data_Scrapping_and_Pre_Processing.gmail_auth import get_authenticated_email, load_existing_token
from model_dashboard import plotDataset

# Authenticate Gmail API
service = load_existing_token()
user_email = get_authenticated_email(service)
user_name = user_email.split("@")[0]

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
db = mongo_client["User-Activity-Analysis"]
collection = db[user_name]
emails = pd.DataFrame(list(collection.find({}, {"_id": 0, "from": 1, "category": 1, "Entities_names": 1, "sentiment": 1})))
emails['category'] = emails['category'].fillna('Unknown')
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

display(widgets.Label("📊 Email Distribution by Category:"))
plotDataset(emails["category"], user_name)

display(widgets.Label("📬 Top 10 Email Senders:"))
plot_top_senders()

display(widgets.Label("📈 Sentiment Analysis of Emails:"))
plot_sentiment_distribution()