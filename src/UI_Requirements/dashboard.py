import pymongo
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import ipywidgets as widgets
from wordcloud import WordCloud
from IPython.display import display
from src.Data_Scrapping_and_Pre_Processing.gmail_auth import get_authenticated_email, load_existing_token

# Authenticate Gmail API
service = load_existing_token()
user_email = get_authenticated_email(service)
user_name = user_email.split("@")[0]

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
db = mongo_client["User-Activity-Analysis"]
collection = db[user_name]

# Fetch emails from MongoDB
emails = pd.DataFrame(list(collection.find({}, {"_id": 0, "from": 1, "category": 1, "Entities_names": 1, "sentiment": 1})))

# Ensure fields exist
emails['category'] = emails['category'].fillna('Unknown')
emails['sentiment'] = emails['sentiment'].fillna('Neutral')

# 📌 Total Emails Count
total_emails = len(emails)

# 📊 Plot Email Distribution by Category
def plot_email_distribution():
    plt.figure(figsize=(8, 4))
    sns.countplot(y=emails['category'], order=emails['category'].value_counts().index)
    plt.title("Email Count by Category")
    plt.xlabel("Count")
    plt.ylabel("Category")
    plt.show()

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

# ☁️ Generate Word Cloud for Named Entities
def plot_named_entity_cloud():
    entity_text = ' '.join([' '.join(entities) for entities in emails['Entities_names'].dropna()])
    wordcloud = WordCloud(width=800, height=400, background_color="white").generate(entity_text)
    plt.figure(figsize=(10, 5))
    plt.imshow(wordcloud, interpolation="bilinear")
    plt.axis("off")
    plt.title("Word Cloud of Named Entities in Emails")
    plt.show()

# 🚀 Display Dashboard
print(f"📩 Total Emails Fetched: {total_emails}")

display(widgets.Label("📊 Email Distribution by Category:"))
plot_email_distribution()

display(widgets.Label("📬 Top 10 Email Senders:"))
plot_top_senders()

display(widgets.Label("📈 Sentiment Analysis of Emails:"))
plot_sentiment_distribution()

display(widgets.Label("☁️ Named Entity Word Cloud:"))
plot_named_entity_cloud()