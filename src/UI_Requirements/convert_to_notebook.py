import nbformat as nbf

with open("dashboard.py", "r", encoding="utf-8") as f:
    python_code = f.readlines()
notebook = nbf.v4.new_notebook()
notebook.cells.append(nbf.v4.new_code_cell("".join(python_code)))
with open("dashboard.ipynb", "w", encoding="utf-8") as f:
    nbf.write(notebook, f)

print("✅ Conversion Successful! Run `voila dashboard.ipynb` now.")