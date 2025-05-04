import pandas as pd
csv_file_path = '../../../dependencies/meetings_dataset.csv'
df = pd.read_csv(csv_file_path)
df = df.sample(frac=1).reset_index(drop=True)
category_counts = df['category'].value_counts()
df.to_csv(csv_file_path, index=False)
print("CSV rows shuffled successfully...")
print("Category counts:")
print(category_counts)