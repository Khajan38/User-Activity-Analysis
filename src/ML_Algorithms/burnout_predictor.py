#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import pickle
import pandas as pd
from src.ML_Algorithms.burnout_features import burnoutFeaturesRange, compute_burnout_for_day

# Load the trained model
with open("dependencies/burnout_LR.pkl", "rb") as model_file:
    classifier = pickle.load(model_file)

def predict_burnout_range(collection, collectionM, collectionC):
     df = pd.DataFrame(burnoutFeaturesRange(collection, collectionM, collectionC))
     feature_cols = [
         'total_emails', 'total_meetings', 'night_emails',
         'negative_sentiment_ratio', 'urgent_meeting_count',
         'avg_urgency_score'
     ]
     X = df[feature_cols]
     df['burnout'] = classifier.predict(X)
     print("✅ Burnout prediction complete!") #From today as 1st entry to last 15 days
     return list(df["burnout"])


def predict_burnout_for_today(collection, collectionM, collectionC):
    predictionsToday = compute_burnout_for_day(0, collection, collectionM, collectionC)
    df = pd.DataFrame([predictionsToday])
    feature_cols = [
        'total_emails', 'total_meetings', 'night_emails',
        'negative_sentiment_ratio', 'urgent_meeting_count',
        'avg_urgency_score'
    ]
    X = df[feature_cols]
    df['burnout'] = classifier.predict(X)
    return predictionsToday, list(df["burnout"])[0]