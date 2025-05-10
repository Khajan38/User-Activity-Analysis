import pymongo
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.decomposition import TruncatedSVD, PCA
from src.ML_Algorithms.Implemented_Algos.TF_IDF import TfidfVectorizer
from src.Data_Scrapping_and_Pre_Processing.gmail_auth import get_authenticated_email, load_existing_token

# Authenticate Gmail API
service = load_existing_token()
user_email = get_authenticated_email(service)
user_name = user_email.split("@")[0]

# Connect to MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")
db = mongo_client["User-Activity-Analysis"]
collection = db[user_name]
emails_texts = pd.DataFrame(list(collection.find({}, {"body": 1})))

#Form TF-IDF Vectorizer
vectorizer = TfidfVectorizer(max_df=0.9, min_df=2)
X_Vector = vectorizer.compute_TF_IDF(emails_texts, "body")

#Form better clusters using SVD
svd = TruncatedSVD(n_components=100, random_state=42)
X_reduced = svd.fit_transform(X_Vector)

inertias = []
for k in range(1, 10):
    km = KMeans(n_clusters=k, random_state=42)
    km.fit(X_reduced)
    inertias.append(km.inertia_)

plt.plot(range(1, 10), inertias, marker='o')
plt.xlabel('Number of clusters')
plt.ylabel('Inertia')
plt.title('Elbow Method')
plt.show()

pca = PCA(n_components=2, random_state=42)
X_pca = pca.fit_transform(X_reduced)

kmeans = KMeans(n_clusters=3, random_state=42)
kmeans.fit(X_reduced)
labels = kmeans.labels_

plt.figure(figsize=(8, 6))
scatter = plt.scatter(X_pca[:, 0], X_pca[:, 1], c=labels, cmap='Set1', s=50)
centers_pca = pca.transform(kmeans.cluster_centers_)
plt.scatter(centers_pca[:, 0], centers_pca[:, 1], c='black', marker='x', s=100, label='Centroids')

plt.title("KMeans Clustering (Visualized in 2D via PCA)")
plt.xlabel("PCA Component 1")
plt.ylabel("PCA Component 2")
plt.legend()
plt.grid(True)
plt.show()


emails_texts['cluster'] = labels
for cluster_num in sorted(emails_texts['cluster'].unique()):
    print(f"\n🟢 Cluster {cluster_num} Emails:")
    cluster_emails = emails_texts[emails_texts['cluster'] == cluster_num]
    for i, row in cluster_emails.head(3).iterrows():
        print(f"\nEmail {i + 1}:")
        print(row['body'])