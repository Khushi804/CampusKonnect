from flask import Flask, request, jsonify
import joblib
import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from imblearn.over_sampling import SMOTE
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import VotingClassifier
from sklearn.metrics import accuracy_score, classification_report
import warnings
warnings.filterwarnings("ignore")

app = Flask(__name__)

# Load the pre-trained model and vectorizer
model = joblib.load('ensemble_model.pkl')
vectorizer = joblib.load('tfidf_vectorizer.pkl')


@app.route('/')
def home():
    return "Content Filtering API is running!"


# API endpoint to handle predictions
@app.route('/predict', methods=['GET'])
def predict():
    # Get the data (text) from the POST request
    text = request.args.get('text')

    # Preprocess and vectorize the input text
    X_vectorized = vectorizer.transform([text])

    # Make prediction
    prediction = model.predict(X_vectorized)[0]

    # Send the prediction result
    return jsonify({'prediction': int(prediction)})


if __name__ == '__main__':
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5009)
