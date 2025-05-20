#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

from concurrent.futures import ThreadPoolExecutor
from src.Data_Scrapping_and_Pre_Processing.fetchEmail import fetch_emails
from src.Data_Scrapping_and_Pre_Processing.pre_processing import process_emails
from src.ML_Algorithms.spam_categorization import classify_emails
from src.ML_Algorithms.meeting_heuristics import hybrid_predict
from src.ML_Algorithms.sentiment_analysis import sentimentAnalysis
from src.ML_Algorithms.meetings_DataExtraction import processMeetingEmails

class Pipeline:
    def __init__(self, profile_email, collection, collectionM, collectionC, tempCollection):
        self.profile_email = profile_email
        self.collection = collection
        self.collectionM = collectionM
        self.collectionC = collectionC
        self.tempCollection = tempCollection

    def pipeline(self):
        fetch_emails(self.profile_email, self.collection, self.tempCollection)
        process_emails(self.collection)
        classify_emails(self.collection)
        hybrid_predict(self.collection)
        sentimentAnalysis(self.collection)
        processMeetingEmails(self.collection, self.collectionM)