import math
import concurrent.futures
from collections import Counter
from scipy.sparse import csr_matrix

#TF-IDF (Term Frequency-Inverse Document Frequency) is a statistical measure used in natural language processing and information retrieval to evaluate the importance of a word in a document relative to a collection of documents (corpus). It combines two metrics: Term Frequency (TF) and Inverse Document Frequency (IDF).

class TfidfVectorizer:
    def __init__(self, max_df = 1.0, min_df = 1):
        self.X_ref = None #Data Frame for current vectorizer
        self.X_vectors = [] #List of dictionaries giving TF of every word for each record
        self.IDF = {} #Stores the IDF for DF giving word frequency based on no. of records
        self.word_index = {} #Stores the order of words in the whole csv
        self.max_df = max_df #To remove all words that appear in all files
        self.min_df = min_df #To remove all words that are less common

    def setup(self, df, column_name):
        if column_name not in df.columns:
            raise ValueError(f"DataFrame must contain '{column_name}' column")
        self.X_ref = df[column_name]

    @staticmethod
    def process_document (text):
        tokens = text.split()
        noOfWords = len(tokens)
        document = Counter(tokens) #Counter is dictionary that itself count frequency of a list parameter given to it
        document = {word: freq / noOfWords for word, freq in document.items()} #Computes TF for 1 record
        return document

    def traverse_documents(self):
        if self.X_ref is None:
            raise ValueError("X_ref is not initialized. Call setup() first.")
        # Multithreading for X_vectors storing the TF of each record (record-frequency)
        with concurrent.futures.ThreadPoolExecutor() as executor:
            self.X_vectors = list(executor.map(self.process_document, self.X_ref))
        #Caluclating document-frequency of word for csv in IDF (IDF is document-based not record-based)
        for doc in self.X_vectors:
            for word in doc.keys():
                self.IDF[word] = self.IDF.get(word, 0) + 1
        #Apply the min_df and max_df in IDF
        filtered_words = {}
        no_of_documents = len(self.X_vectors)
        for word, count in self.IDF.items():
            if isinstance(self.max_df, float): max_allowed = self.max_df * no_of_documents
            else: max_allowed = self.max_df
            if self.min_df <= count <= max_allowed: filtered_words[word] = count
        self.IDF = filtered_words
        #Stores the order in which words are present in the IDF
        self.word_index = {word: i for i, word in enumerate(self.IDF.keys())}

    def to_sparse_matrix(self):
        rows, cols, values = [], [], []
        for doc_idx, doc in enumerate(self.X_vectors):
            for word, tfidf_value in doc.items():
                if word in self.word_index:
                    rows.append(doc_idx)
                    cols.append(self.word_index[word])
                    values.append(tfidf_value)
        return csr_matrix((values, (rows, cols)), shape=(len(self.X_vectors), len(self.word_index)))

    #This function is the main function used at the time of the training to vectorize the data
    def compute_TF_IDF (self, df, column_name):
        try:
            self.setup(df, column_name)
            self.traverse_documents()
        except Exception as e: raise e
        noOfDocuments = len(self.X_vectors)
        #Calculates the IDF using the previously stored frequencies in IDF
        for word in self.IDF:
            self.IDF[word] = math.log((noOfDocuments + 1)/ (self.IDF[word] + 1))
        #Calculating final TF*IDF in X_vectors
        for document in self.X_vectors:
            keys = list(document.keys())
            for key in keys:
                if key in self.IDF:
                    document[key] *= self.IDF[key]
                else:
                    del document[key]
        return self.to_sparse_matrix() #Converts the formed matrix to sparse matrix

    #This is the function that is used to convert the new/unseen text(s) into the same TF-IDF vector format as the training data.
    def transform(self, texts):
        if not self.word_index or not self.IDF:
            raise ValueError("TfidfVectorizer is not fitted yet. Call compute_TF_IDF first.")
        if isinstance(texts, str): texts = [texts]
        transformed_vectors = [self.process_document(text) for text in texts]
        for document in transformed_vectors:
            for word in list(document.keys()):
                if word in self.IDF: document[word] *= self.IDF[word]
                else: del document[word]
        self.X_vectors = transformed_vectors
        return self.to_sparse_matrix()

# if __name__ == "__main__":
#     data = {"processed_text": ["buy car from dealership", "buy house invest money", "sell car house"]}
#     df = pd.DataFrame(data)
#     vectorizer = TfidfVectorizer(0.9, 1)
#     print(vectorizer.compute_TF_IDF(df, "processed_text"))