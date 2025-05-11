#Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import os

def initializeAPI(user_Name="example", user_Email="example@gmail.com"):
    from src.user_context_manager import update_user_context
    update_user_context(
        user_name=user_Name,
        user_email=user_Email,
        collection=user_Name,
        collectionM=f"Meetings_{user_Name}",
        collectionC=f"Meetings_{user_Name}_Calendar",
        tempCollection=f"temp_{user_Name}"
    )

def trainModels():
    spam_model_path = os.path.abspath('dependencies/spam_NB.pkl')
    spam_vectorizer_path = os.path.abspath('dependencies/spam_vectorizer.pkl')
    meetings_model_path = os.path.abspath('dependencies/meetings_NB.pkl')
    meetings_vectorizer_path = os.path.abspath('dependencies/meetings_NB.pkl')
    if not os.path.exists(spam_model_path or spam_vectorizer_path):
        os.system("python src/ML_Algorithms/spam_classifier.py")
    else: print("spam already exits...")
    if not os.path.exists(meetings_model_path or meetings_vectorizer_path):
        os.system("python src/ML_Algorithms/meeting_classifier.py")
    else: print("meetings already exits...")

def downloadNLTKSpacy():
    nltk_data_path = os.path.abspath('dependencies/nltk_data')
    if not os.path.exists(nltk_data_path):os.makedirs(nltk_data_path)
    os.environ['NLTK_DATA'] = str(nltk_data_path)
    import nltk
    nltk.data.path.clear()
    nltk.data.path.append(str(nltk_data_path))
    resources = ['punkt.zip', 'punkt_tab.zip', 'stopwords.zip', 'wordnet.zip', 'omw-1.4.zip', 'vader_lexicon.zip']
    for resource in resources:
        try:
            nltk.data.find(f"corpora/{resource}")
            print(f"{resource} already exists.")
        except LookupError:
            try:
                nltk.data.find(f"tokenizers/{resource}")
                print(f"{resource} already exists.")
            except LookupError:
                try:
                    nltk.data.find(f"sentiment/{resource}")
                    print(f"{resource} already exists.")
                except LookupError:
                    print(f"{resource} not found. Downloading...")
                    nltk.download(resource.replace('.zip', ''), download_dir=nltk_data_path)