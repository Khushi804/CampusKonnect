import re
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from imblearn.over_sampling import SMOTE
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import VotingClassifier
from sklearn.metrics import accuracy_score, classification_report

# Load the ensemble model
ensemble_model = joblib.load('ensemble_model.pkl')

# Load the TF-IDF vectorizer
tfidf_vectorizer = joblib.load('tfidf_vectorizer.pkl')


from flask import Flask, request, jsonify, render_template
import joblib
import re

app = Flask(__name__)

def preprocess_new_text(text):
    # Same as the preprocessing function above
    text = text.lower()
    text = re.sub(r"http\S+|@\S+|#\S+", "", text)
    text = re.sub(r"[^a-zA-Z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


# Custom offensive word list
offensive_words = ['boobs', 'dickhead', '']


def contains_offensive_word(text):
    for word in offensive_words:
        if word in text:
            return True
    return False


def predict_content(text):
    if contains_offensive_word(text):
        return 1  # Flag as offensive based on custom list
    # Same as the prediction function above
    processed_text = preprocess_new_text(text)
    text_vector = tfidf_vectorizer.transform([processed_text])
    y_prob = ensemble_model.predict_proba(text_vector)
    threshold = 0.7
    prob = y_prob[0]
    if prob[0] > threshold:
        prediction = 0
    else:
        prediction = 1 if prob[1] > prob[2] else 2
    return prediction


# Home route to render the HTML form
@app.route('/')
def home():
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    text = data.get('text', '')
    prediction = predict_content(text)
    response = {
        'prediction': prediction
    }
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)

