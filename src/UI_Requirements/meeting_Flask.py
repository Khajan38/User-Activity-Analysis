#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from src.ML_Algorithms.Implemented_Algos.TF_IDF import TfidfVectorizer
from src.Data_Scrapping_and_Pre_Processing.pre_processing import preprocess_dataFrame
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix,  roc_curve, auc

df = pd.read_csv("dependencies/meetings_dataset.csv") #Data Frame for Testing Database
df["processed_text"] = df["text"].apply(preprocess_dataFrame)
y = df["category"]
vectorizer = TfidfVectorizer(0.9, 2)
X_vectors = vectorizer.compute_TF_IDF(df, "processed_text")
X_train, X_test, y_train, y_test = train_test_split(X_vectors.toarray(), y, test_size=0.2, random_state=42)
with open("dependencies/meetings_NB.pkl", "rb") as model_file: classifier = pickle.load(model_file)
y_pred = classifier.predict(X_test)
y_score = classifier.getPredictedScores()

def get_meetings_data():
    global y_score
    class_names = list(classifier.classMap.keys())
    columnMap = classifier.classMap

    # Category Counts for Bar Chart
    train_counts = y_train.value_counts().to_dict()
    test_counts = y_test.value_counts().to_dict()

    cm = confusion_matrix(y_test, y_pred).tolist()  #For Confusion Matrix
    accuracy = accuracy_score(y_test, y_pred) #For Accuracy
    best_thresholds = {"meeting":0.83, "non-meeting":0.09}#Best Thresholds for ROC Curve

    #For ROC Data
    roc_data = {}
    y_score = np.array(y_score)
    y_test_bin = [[1 if key == label else 0 for key in columnMap] for label in y_test]
    y_test_bin = np.array(y_test_bin)
    for class_name, i in columnMap.items():
        fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
        roc_data[class_name] = {
            "fpr": fpr.tolist(),
            "tpr": tpr.tolist(),
            "auc": auc(fpr, tpr),
            "threshold": class_name
        }

    # Probabilities and correctness
    probability_data = []
    for i in range(len(y_score)):
        for class_name in class_names:
            prob = y_score[i][columnMap[class_name]]
            probability_data.append({
                'class': class_name,
                'probability': prob,
                'correct': y_test.iloc[i] == y_pred[i]
            })

    report = classification_report(y_test, y_pred, target_names=['meetings', 'non-meetings'], output_dict=True)

    return {
        "total_emails": len(df),
        "confusion_matrix": cm,
        "roc_data": roc_data,
        "accuracy": accuracy,
        "train_counts": train_counts,
        "test_counts": test_counts,
        "probability_data": probability_data,
        "standard_class_order": class_names,
        "best_thresholds": best_thresholds,
        'classification_report': report
    }