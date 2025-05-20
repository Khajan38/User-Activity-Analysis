# Root Directory in System Path
import pickle
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.metrics import classification_report
from test.model_dashboard import plotDataset, plotConfusionMatrix

import pandas as pd

# Load dataset
df = pd.read_csv("dependencies/burnout_dataset.csv")
X = df.drop(columns=["burnout"])
y = df["burnout"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

# Model pipeline: StandardScaler + LogisticRegression
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
pipe.fit(X_train, y_train)

plotDataset(y_train, "Training Dataset") #Plotting Training Bar Chart
y_pred = pipe.predict(X_test)
plotDataset(y_test, "Testing Dataset") #Plotting Testing Bar Chart
accuracy = plotConfusionMatrix(y_test, y_pred) #Plot Confusion Matrix and get accuracy
print("\nFeature Summary:", X.describe())
print(f"✅ Model Accuracy: {accuracy * 100:.2f}%")
print(classification_report(y_test, y_pred, target_names=['ham', 'spam']))

#Save model & vectorizer
with open("dependencies/burnout_LR.pkl", "wb") as model_file:
    pickle.dump(pipe, model_file)

print("✅ Model training complete! Classifier saved.")