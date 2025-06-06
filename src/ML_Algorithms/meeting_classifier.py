#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from src.ML_Algorithms.Implemented_Algos.TF_IDF import TfidfVectorizer
from src.ML_Algorithms.Implemented_Algos.Naive_Bayes_Classifier import MultinomialNB
from test.model_dashboard import plotDataset, plotConfusionMatrix, plotROCCurve, plotProbabilitiesWithThresholds
from src.Data_Scrapping_and_Pre_Processing.pre_processing import preprocess_dataFrame

df = pd.read_csv("dependencies/meetings_dataset.csv") #Data Frame for Testing Database
if "text" not in df.columns or "category" not in df.columns:
    raise ValueError("CSV file must contain 'text' and 'category' columns.")

df["processed_text"] = df["text"].apply(preprocess_dataFrame)
y = df["category"]
vectorizer = TfidfVectorizer(0.9, 2)
X_vectors = vectorizer.compute_TF_IDF(df, "processed_text")

X_train, X_test, y_train, y_test = train_test_split(X_vectors.toarray(), y, test_size=0.2, random_state=42)

best_thresholds = {"meeting":0.83, "non-meeting":0.09}
classifier = MultinomialNB(best_thresholds)
classifier.fit(X_train, y_train)
plotDataset(y_train, "Training Dataset")
y_pred = classifier.predict(X_test)
plotDataset(y_test, "Testing Dataset")
accuracy = plotConfusionMatrix(y_test, y_pred)
y_score = classifier.getPredictedScores()
plotROCCurve(y_test, y_score, classifier.classMap)
print(f"✅ Model Accuracy: {accuracy * 100:.2f}%")
plotProbabilitiesWithThresholds(y_test, y_pred, y_score, classifier.classMap, best_thresholds)

#Save model & vectorizer
with open("dependencies/meetings_NB.pkl", "wb") as model_file:
    pickle.dump(classifier, model_file)
with open("dependencies/meetings_vectorizer.pkl", "wb") as vectorizer_file:
    pickle.dump(vectorizer, vectorizer_file)

print("✅ Model training complete! Classifier saved.")