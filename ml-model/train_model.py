
import json
from pathlib import Path

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split

print("Starting model training...")

np.random.seed(42)

days = np.arange(1, 366)
temperatures = (
    28
    + 7 * np.sin(2 * np.pi * days / 365)
    + np.random.normal(0, 2, size=len(days))
)

X = days.reshape(-1, 1)
y = temperatures

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

model = LinearRegression()
model.fit(X_train, y_train)

predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)

next_day = np.array([[366]])
predicted_temperature = float(model.predict(next_day)[0])

results = {
    "predicted_temperature": round(predicted_temperature, 1),
    "mean_absolute_error": round(float(mae), 2),
    "model_type": "Linear Regression",
    "data_type": "Synthetic sample data",
}

output_path = Path(__file__).parent / "model_results.json"
output_path.write_text(json.dumps(results, indent=2), encoding="utf-8")

print("Model training completed.")
print(f"Mean Absolute Error: {mae:.2f} °C")
print(f"Sample prediction: {predicted_temperature:.1f} °C")
print(f"Results saved to: {output_path}")
