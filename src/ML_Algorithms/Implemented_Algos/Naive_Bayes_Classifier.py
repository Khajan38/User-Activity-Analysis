import math
import numpy as np
import pandas as pd
from keras.src.ops import threshold
from pymongo.synchronous.pool import PoolState

from src.ML_Algorithms.Implemented_Algos.TF_IDF import TfidfVectorizer

#Multinomial Naive Bayes (Multinomial NB) is a probabilistic classifier based on Bayes’ Theorem. It is particularly suited for discrete features like word counts, frequencies, or TF-IDF values in text classification problems.

class MultinomialNB:
    def __init__(self, threshold = None, alpha = 1.0):
        self.alpha = alpha #Laplace Smoothening for log Probabilities to avoid log(0)
        self.classMap = {} #Stores the sorted order of class labels
        self.wordProbabilities = [] #2D NumPy array that holds individual words probabilities for each class
        self.classProbabilities = [] #Holds the class probabilities for Bayes Theorem
        self.probabilities = [] #Stores the test dataframe probabilities for final predictions
        self.threshold = threshold  # Threshold values for class prediction

    def populateClass(self, y_train):
        unique_classes = sorted(set(y_train))
        self.classMap = {cls: i for i, cls in enumerate(unique_classes)} #Populates unique categories in sorted manner
        self.classProbabilities = np.zeros(len(unique_classes)) #Initializes 1D NumPy array for each class
        if self.threshold is None: self.threshold = {cls: 0.5 for cls in unique_classes} #Writes default threshold as 0.5
        else:
            modified_threshold = {cls: self.threshold.get(cls, 0.5) for cls in unique_classes}
            self.threshold = modified_threshold

    #This is the main function for starting training the model
    def fit(self, X_train, y_train):
        y_train = np.array(y_train)
        self.populateClass(y_train)
        vocab_size = X_train.shape[1] #Counts total individual words in the TF-IDF vector
        num_classes = len(self.classMap)
        self.wordProbabilities = np.zeros((num_classes, vocab_size)) #2D NumPy array of zeros with shape (num_classes, vocab_size)
        for i, row in enumerate(X_train):
            curClass = y_train[i]
            curIndex = self.classMap[curClass]
            self.classProbabilities[curIndex] += 1 #Counts the frequency for each class
            #Formula: count(w_k | y = j) += TF-IDF_k for all k
            self.wordProbabilities[curIndex] += row.flatten() #Accumulate TF-IDF vectors for each class
        total_samples = len(y_train)
        for i in range(num_classes):
            # Formula: total_words_in_class = ∑_k TF-IDF(w_k | y = i) for all features k
            total_words_in_class = np.sum(self.wordProbabilities[i]) #Sum of all TF-IDF of all words for a class
            self.wordProbabilities[i] = np.log((self.wordProbabilities[i] + self.alpha)/(total_words_in_class + self.alpha * vocab_size)) #Changing simple probabilities into word probabilities
            #Change class frequency to log class probability: log P(y = i) = log(count(y = i) / total_samples)
            self.classProbabilities[i] = math.log(self.classProbabilities[i]/total_samples)

    # Converts log-probabilities (from predict) into normal probabilities using softmax trick
    def predict_proba(self):
        if not self.probabilities:
            raise ValueError("probabilities is not initialized. Call predict() first.")
        probabilities_corrected = []
        for record in self.probabilities:
            max_log_prob = max(record)
            #Converts from log probability to relative exponential probability: exp_probs[j] = exp(log P(y = j | x) - max_log_prob)
            exp_probs = [math.exp(i - max_log_prob) for i in record]
            sum_exp_probs = sum(exp_probs)
            #Normalize to get actual probabilities: P(y = j | x) = exp_probs[j] / sum(exp_probs)
            normalized_probs = [i / sum_exp_probs for i in exp_probs]
            probabilities_corrected.append(normalized_probs)
        return probabilities_corrected

    # This is the main function for starting predicting from model
    def predict(self, X_test):
        result = []
        self.probabilities = [] #2-D array to contain all Class Probabilities as column for each record in Dataframe
        for row in X_test:
            probability = [] #Storing probability of each class for each test record
            for curClass, j in self.classMap.items():
                classProbability = self.classProbabilities[j] #Class Probability of current class
                featureProbability = np.dot(row, self.wordProbabilities[j]) #Features Probability for every word probability in current record with log Probability in current class:
                # logP(x | y = j) = ∑_k [x_k * logP(w_k | y = j)] for all features k
                total_prob = classProbability + featureProbability #total_log_prob = log P(y = j) + log P(x | y = j)
                probability.append(total_prob)
            self.probabilities.append(probability)

        self.probabilities = self.predict_proba()

        most_probable_class = max(self.classMap, key=lambda cls: self.classProbabilities[self.classMap[cls]])
        for probability in self.probabilities:
            max_prob = float("-inf")
            second_max_prob = float("-inf")
            pred_class = None
            second_pred_class = None
            for curClass, j in self.classMap.items():
                total_prob = probability[j]
                if total_prob > max_prob:
                    second_max_prob = max_prob
                    max_prob = total_prob
                    second_pred_class = pred_class
                    pred_class = curClass
                elif total_prob > second_max_prob:
                    second_max_prob = total_prob
                    second_pred_class = curClass
            #Safe Play as threshold is generally used for binary classifier
            if max_prob > self.threshold[pred_class]: result.append(pred_class) #Predict class if the value is above threshold
            elif second_max_prob > self.threshold[second_pred_class]: result.append(second_pred_class)
            else: result.append(most_probable_class)
        return result

    def getPredictedScores (self):
        if not self.probabilities:
            raise ValueError("probabilities is not initialized. Call predict() first.")
        return self.probabilities

# if __name__ == "__main__":
#     documents = [
#         "The cat sat on the mat",
#         "The dog barked at the cat",
#         "The cat chased the mouse"
#     ]
#     df = pd.DataFrame({"processed_text": documents})
#     labels = np.array([0, 1, 0])
#     vectorizer = TfidfVectorizer()
#     X_vectors = vectorizer.compute_TF_IDF(df, "processed_text").toarray()
#     classifier = MultinomialNB()
#     classifier.fit(X_vectors, labels)
#     X_test = vectorizer.transform(["barked at"])
#     result = classifier.predict(X_test.toarray())
#     for i in result: print(i)
#     print("Model trained successfully!")