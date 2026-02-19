import sys
import numpy as np
from sklearn.linear_model import LogisticRegression

# Dummy training dataset
X = np.array([
    [10000, 50000, 1, 1, 0, 0],
    [90000, 50000, 6, 5, 1, 1],
    [20000, 80000, 0, 1, 0, 0],
    [120000, 60000, 7, 6, 1, 1]
])

y = np.array([0, 1, 0, 1])  # 0 = genuine, 1 = fraud

model = LogisticRegression()
model.fit(X, y)

# Input from Node
claimAmount = float(sys.argv[1])
coverage = float(sys.argv[2])
claimHistory = float(sys.argv[3])
frequency = float(sys.argv[4])
duplicateDocs = float(sys.argv[5])
suspiciousTx = float(sys.argv[6])

prediction = model.predict_proba([[claimAmount, coverage, claimHistory, frequency, duplicateDocs, suspiciousTx]])

print(prediction[0][1])
