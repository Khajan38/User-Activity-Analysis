import pandas as pd
import pickle
import re
import spacy
import nltk
from Implemented_Algos.TF_IDF import TfidfVectorizer
from sklearn.model_selection import train_test_split
from src.ML_Algorithms.Implemented_Algos.Naive_Bayes_Classifier import MultinomialNB
from src.UI_Requirements.model_dashboard import plotDataset, plotConfusionMatrix, plotROCCurve

# Load NLP tools
nlp = spacy.load("en_core_web_sm")
stop_words = set(nltk.corpus.stopwords.words("english"))
lemmatizer = nltk.WordNetLemmatizer()

def preprocess_text(text):
    if not text:
        return ""
    text = re.sub(r"https?://\S+", "", text)
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text).strip()
    words = [
        lemmatizer.lemmatize(word)
        for word in nltk.word_tokenize(text)
        if word not in stop_words
    ]
    return " ".join(words)

df = pd.read_csv("../../dependencies/emails_dataset.csv") #Data Frame for Testing Database
if "text" not in df.columns or "category" not in df.columns:
    raise ValueError("CSV file must contain 'text' and 'category' columns.")

df["processed_text"] = df["text"].apply(preprocess_text)
y = df["category"]
vectorizer = TfidfVectorizer()
X_vectors = vectorizer.compute_TF_IDF(df)

X_train, X_test, y_train, y_test = train_test_split(X_vectors.toarray(), y, test_size=0.2, random_state=42)

classifier = MultinomialNB()
classifier.fit(X_train, y_train)
plotDataset(y_train, "Training Dataset")
y_pred = classifier.predict(X_test)
plotDataset(y_test, "Testing Dataset")
accuracy = plotConfusionMatrix(y_test, y_pred)
y_score = classifier.predict_proba()
plotROCCurve(y_test, y_score, classifier.classMap)
print(f"✅ Model Accuracy: {accuracy * 100:.2f}%")

#Save model & vectorizer
with open("../../dependencies/naive_bayes_model.pkl", "wb") as model_file:
    pickle.dump(classifier, model_file)
with open("../../dependencies/vectorizer.pkl", "wb") as vectorizer_file:
    pickle.dump(vectorizer, vectorizer_file)

print("✅ Model training complete! Classifier saved.")