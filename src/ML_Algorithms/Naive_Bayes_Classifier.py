import math
import numpy as np

class MultinomialNB:
    def __init__(self, alpha = 1.0):
        self.alpha = alpha
        self.classMap = {}
        self.wordProbabilities = []
        self.classProbabilities = []

    def populateClass(self, y_train):
        unique_classes = list(set(y_train))
        self.classMap = {cls: i for i, cls in enumerate(unique_classes)}
        self.classProbabilities = np.zeros(len(unique_classes))

    def fit(self, X_train, y_train):
        y_train = np.array(y_train)
        self.populateClass(y_train)
        vocab_size = X_train.shape[1]
        num_classes = len(self.classMap)
        self.wordProbabilities = np.zeros((num_classes, vocab_size))
        for i, row in enumerate(X_train):
            curClass = y_train[i]
            curIndex = self.classMap[curClass]
            self.classProbabilities[curIndex] += 1
            self.wordProbabilities[curIndex] += row
        total_samples = len(y_train)
        for i in range(num_classes):
            total_words_in_class = np.sum(self.wordProbabilities[i])
            self.wordProbabilities[i] = np.log((self.wordProbabilities[i] + self.alpha)/(total_words_in_class + self.alpha * vocab_size))
            self.classProbabilities[i] = math.log(self.classProbabilities[i]/total_samples)
        print(self.wordProbabilities)

    def predict(self, X_test):
        result = []
        for row in X_test:
            max_prob = float("-inf")
            pred_class = None
            for curClass, j in self.classMap.items():
                classProbability = self.classProbabilities[j]
                featureProbability = np.dot(row, self.wordProbabilities[j])
                total_prob = classProbability + featureProbability
                if total_prob > max_prob:
                    max_prob = total_prob
                    pred_class = curClass
            result.append(pred_class)
        return result

# if __name__ == "__main__":
#     documents = [
#         "The cat sat on the mat",
#         "The dog barked at the cat",
#         "The cat chased the mouse"
#     ]
#     df = pd.DataFrame({"processed_text": documents})
#     labels = np.array([0, 1, 0])
#     vectorizer = TfidfVectorizer()
#     X_vectors = vectorizer.compute_TF_IDF(df).toarray()
#     classifier = MultinomialNB()
#     classifier.fit(X_vectors, labels)
#     X_test = vectorizer.transform(["barked at"])
#     result = classifier.predict(X_test.toarray())
#     for i in result: print(i)
#     print("Model trained successfully!")