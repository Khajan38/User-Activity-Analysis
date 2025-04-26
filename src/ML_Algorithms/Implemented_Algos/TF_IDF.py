import math
import concurrent.futures
from collections import Counter
from scipy.sparse import csr_matrix

class TfidfVectorizer:
    def __init__(self):
        self.X_ref = None
        self.X_vectors = []
        self.IDF = {}
        self.word_index = {}

    def setup (self, df):
        if "processed_text" not in df.columns:
            raise ValueError("DataFrame must contain 'processed_text' column")
        self.X_ref = df["processed_text"]

    @staticmethod
    def process_document (text):
        tokens = text.split()
        noOfWords = len(tokens)
        document = Counter(tokens)
        document = {word: freq / noOfWords for word, freq in document.items()}
        return document

    def traverse_documents(self):
        if self.X_ref is None:
            raise ValueError("X_ref is not initialized. Call setup() first.")
        with concurrent.futures.ThreadPoolExecutor() as executor:
            self.X_vectors = list(executor.map(self.process_document, self.X_ref))
        for doc in self.X_vectors:
            for word in doc.keys():
                self.IDF[word] = self.IDF.get(word, 0) + 1
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

    def compute_TF_IDF (self, df):
        self.setup(df)
        self.traverse_documents()
        if not self.X_vectors:
            raise ValueError("Call 'traverse_documents' first to calculate TF values.")
        noOfDocuments = len(self.X_vectors)
        for word in self.IDF:
            self.IDF[word] = math.log((noOfDocuments + 1)/ (self.IDF[word] + 1))
        for document in self.X_vectors:
            for key in document:
                document[key] *= self.IDF[key]
        return self.to_sparse_matrix()

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
#     vectorizer = TfidfVectorizer()
#     print(vectorizer.compute_TF_IDF(df))