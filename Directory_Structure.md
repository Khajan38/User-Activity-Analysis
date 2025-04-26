``` 
User-Activity-Analysis/
│── data/                                         # Stores collected data, tokens, credentials
│── notebooks/                                    # Jupyter notebooks for exploration & experiments
│── dependencies/                                 # External dependencies or environment setup files
│── src/                                          # Core Python scripts
│   ├── Data_Scraping_and_Preprocessing/          # Email fetching and preprocessing scripts
│   │   ├── gmail_auth.py                         # Handles Gmail API authentication
│   │   ├── fetch_emails.py                       # Fetches emails from Gmail API
│   │   └── pre_processing.py                     # Cleans and prepares email data
│   ├── ML_Algorithms/                            # Machine learning Algorithms (Self-Implemented)
│   │   ├── Implemented_Algos                     # Handles Gmail API authentication
│   │   │   ├── Naive_Bayes_Classifier.py         # Naive Bayes Classifier Algorithm
│   │   │   └── TF-IDF.py                         # TF-IDF Vectorization Algorithm
│   │   ├── train_classifiers.py                  # Naive Bayes Classifier Model
│   │   ├── categorization.py                     # Classifies emails into categories
│   │   └── sentiment_analysis.py                 # Performs sentiment analysis on emails
│   ├── UI_Requirements/                          # Scripts related to UI integration (if applicable)
│   │   ├── convert_to_notebook.py                # Converts scripts to Jupyter notebooks
│   │   └── dashboard.py                          # Informative Dashboard for project
│── LICENSE                                       # License details
│── .gitignore                                    # Files to ignore in version control
│── Directory_Structure.md                        # This file (project structure documentation)
│── requirements.txt                              # List of dependencies & installations
└── README.md                                     # Project overview & usage instructions
```