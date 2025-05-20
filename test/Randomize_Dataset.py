# Root Directory in System Path
import sys, os
root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../'))
if root_path not in sys.path:
    sys.path.append(root_path)

import pandas as pd
csv_file_path = 'dependencies/burnout_dataset.csv'
df = pd.read_csv(csv_file_path)
df = df.sample(frac=1).reset_index(drop=True)
category_counts = df['burnout'].value_counts()
df.to_csv(csv_file_path, index=False)
print("CSV rows shuffled successfully...")
print("Category counts:")
print(category_counts)