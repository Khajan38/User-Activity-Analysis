import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
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
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(8,6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=set(y_test), yticklabels=set(y_test))
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    accuracy = accuracy_score(y_test, y_pred)
    plt.title(f"Confusion Matrix (Accuracy: {accuracy * 100:.2f}%)")
    plt.show()
    return accuracy

def plotROCCurve (y_test, y_score, columnMap):
    y_test_bin = []
    for i in y_test:
        binaryRow = []
        for key in columnMap:
            if key == i: binaryRow.append(1)
            else: binaryRow.append(0)
        y_test_bin.append(binaryRow)
    y_test_bin = np.array(y_test_bin)
    plt.figure(figsize=(8,6))
    y_score = np.array(y_score)

    for class_name in columnMap:
        i = columnMap[class_name]
        fpr, tpr, thresholds = roc_curve(y_test_bin[:, i], y_score[:, i])
        roc_auc = auc(fpr, tpr)

        J = tpr - fpr
        best_index = np.argmax(J)
        best_threshold = thresholds[best_index]

        plt.plot(fpr, tpr, label=f"Class {i} (AUC = {roc_auc:.2f})")
        plt.scatter(fpr[best_index], tpr[best_index], marker="o", label=f"Best Threshold {class_name}: {best_threshold:.2f}")

    plt.plot([0,1], [0,1], 'k--')
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve")
    plt.legend()
    plt.show()