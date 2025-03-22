import pandas as pd
import pickle
import re
import spacy
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score

# Load NLP tools
nlp = spacy.load("en_core_web_sm")
stop_words = set(nltk.corpus.stopwords.words("english"))
lemmatizer = nltk.WordNetLemmatizer()

# Load dataset from CSV
df = pd.read_csv("../../dependencies/emails_dataset.csv")  # Update with your dataset filename

# Ensure necessary columns exist
if "text" not in df.columns or "category" not in df.columns:
    raise ValueError("CSV file must contain 'text' and 'category' columns.")

def preprocess_text(text):
    if not text:
        return ""

    # Remove URLs
    text = re.sub(r"https?://\S+", "", text)
    text = text.lower()  # Convert to lowercase
    text = re.sub(r"[^\w\s\d]", "", text).strip()  # Remove special characters

    # Tokenization, Stopword Removal, and Lemmatization
    words = [
        lemmatizer.lemmatize(word)
        for word in nltk.word_tokenize(text)
        if word not in stop_words
    ]

    return " ".join(words)

# Preprocess text
df["processed_text"] = df["text"].apply(preprocess_text)

# Extract features and labels
X = df["processed_text"]
y = df["category"]

# Convert text data into numerical vectors
vectorizer = TfidfVectorizer()
X_vectors = vectorizer.fit_transform(X)

# Split dataset (80% training, 20% testing)
X_train, X_test, y_train, y_test = train_test_split(X_vectors, y, test_size=0.2, random_state=42)

# Train Naïve Bayes classifier
classifier = MultinomialNB()
classifier.fit(X_train, y_train)

# Evaluate accuracy
y_pred = classifier.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"✅ Model Accuracy: {accuracy * 100:.2f}%")

# Save model & vectorizer
with open("../../dependencies/naive_bayes_model.pkl", "wb") as model_file:
    pickle.dump(classifier, model_file)

with open("../../dependencies/vectorizer.pkl", "wb") as vectorizer_file:
    pickle.dump(vectorizer, vectorizer_file)

print("✅ Model training complete! Classifier saved.")