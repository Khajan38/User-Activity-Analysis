import seaborn as sns
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.metrics import confusion_matrix
from sklearn.metrics import roc_curve, auc

def plotDataset (categories, title):
    plt.figure(figsize=(10,4))
    ax = sns.countplot(y=categories, order=categories.value_counts().index, hue=categories, palette="coolwarm", legend=False)
    for container in ax.containers:
        ax.bar_label(container)
    plt.title(title + ": Email Count by Category")
    plt.xlabel("Count")
    plt.ylabel("Category")
    plt.show()

def plotConfusionMatrix (y_test, y_pred):
    all_classes = set(y_test)
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8,6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=all_classes, yticklabels=all_classes)
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    accuracy = accuracy_score(y_test, y_pred)
    plt.title(f"Confusion Matrix (Accuracy: {accuracy * 100:.2f}%)")
    plt.show()
    return accuracy

#Threshold Grid Search for Maximum Accuracy (Per-Class)
def calculate_best_threshold_accuracy(y_test, y_score, columnMap):
    best_thresholds = {}
    for class_name, i in columnMap.items():
        best_acc, best_threshold = 0, 0
        for threshold in np.arange(0.01, 1.0, 0.01):
            predictions = (y_score[:, i] >= threshold).astype(int)
            accuracy = accuracy_score((y_test[:, i] == 1).astype(int), predictions)
            if accuracy > best_acc:
                best_acc = accuracy
                best_threshold = threshold
        best_thresholds[class_name] = best_threshold
    return best_thresholds

# Plots the ROC curve and prints the best threshold per class based on accuracy
def plotROCCurve(y_test, y_score, columnMap):
    y_test_bin = []
    for label in y_test:
        row = [1 if key == label else 0 for key in columnMap]
        y_test_bin.append(row)
    y_test_bin = np.array(y_test_bin)
    y_score = np.array(y_score)
    best_thresholds = calculate_best_threshold_accuracy(y_test_bin, y_score, columnMap)
    plt.figure(figsize=(8, 6))
    for class_name, i in columnMap.items():
        fpr, tpr, thresholds = roc_curve(y_test_bin[:, i], y_score[:, i])
        roc_auc = auc(fpr, tpr)
        plt.plot(fpr, tpr, label=f"{class_name} (AUC = {roc_auc:.2f})")
        threshold = best_thresholds[class_name]
        plt.scatter(fpr[np.argmax(tpr - fpr)], tpr[np.argmax(tpr - fpr)], marker="o", label=f"Best Threshold ({class_name}): {threshold:.2f}")
    plt.plot([0, 1], [0, 1], 'k--', lw=1)
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve")
    plt.legend()
    plt.grid(True)
    plt.show()
    print("Best thresholds for accuracy:")
    for class_name, threshold in best_thresholds.items():
        print(f"\t{class_name}: {threshold:.2f}")

def plotProbabilitiesWithThresholds(y_test, y_pred, y_score, columnMap, best_thresholds):
    class_names = list(columnMap.keys())
    num_classes = len(class_names)
    data = []
    for i in range(len(y_score)):
        for class_name in class_names:
            prob = y_score[i][columnMap[class_name]]
            correct = y_test.iloc[i] == y_pred[i]
            data.append({
                'Class': class_name,
                'Probability': prob,
                'Correct': correct
            })
    df = pd.DataFrame(data)
    plt.figure(figsize=(10, 6))
    sns.stripplot(x='Class', y='Probability', data=df, hue='Correct', jitter=True, alpha=0.6, palette={True: 'green', False: 'red'}, dodge=False)
    for class_name, threshold in best_thresholds.items():
        x_pos = class_names.index(class_name)
        plt.axhline(y=threshold, color='blue', linestyle='--', xmin=(x_pos - 0.4) / num_classes, xmax=(x_pos + 0.4) / num_classes)
    plt.title("Predicted Probabilities Colored by Correctness")
    plt.ylabel("Predicted Probability")
    plt.xlabel("Class")
    plt.legend(title="Correct Prediction")
    plt.grid(True)
    plt.tight_layout()
    plt.show()