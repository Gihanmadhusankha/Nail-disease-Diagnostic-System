from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import logging
import json
import cv2
from ultralytics import YOLO
import datetime
from dotenv import load_dotenv
import secrets

# Load environment variables
load_dotenv()

# --- Flask Setup ---
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# --- Configurations ---
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['RESULT_FOLDER'] = 'static/results'
app.config['JSON_FOLDER'] = 'static/json'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB
app.config['ALLOWED_EXTENSIONS'] = {'jpg', 'jpeg', 'png', 'webp'}
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///predictions.db'
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', secrets.token_hex(16))

# Create necessary directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['RESULT_FOLDER'], exist_ok=True)
os.makedirs(app.config['JSON_FOLDER'], exist_ok=True)

# --- Logging ---
logging.basicConfig(filename='app.log', level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

# --- Load Model ---
MODEL_PATH = os.getenv('MODEL_PATH', 'model/best.pt')
try:
    model = YOLO(MODEL_PATH)
    app.logger.info(f"✅ YOLO model loaded from {MODEL_PATH}")
except Exception as e:
    app.logger.error(f"❌ Failed to load model: {e}")
    raise

# --- Class Labels ---
class_labels = [
    'Acral Lentiginous Melanoma', 'Beaus Line', 'Blue Finger', 'Clubbing', 'Healthy Nail',
      'Onychogryphosis', 'Pitting'
]

# --- Database Setup ---
db = SQLAlchemy(app)

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    json_result = db.Column(db.Text, nullable=False)
    image_path = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

with app.app_context():
    db.create_all()

# --- Helpers ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def preprocess_image(image_path):
    try:
        img = cv2.imread(image_path)
        return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    except Exception as e:
        app.logger.error(f"❌ Failed to preprocess image: {e}")
        return None

def draw_boxes(results, image_path):
    image = cv2.imread(image_path)
    predictions = []

    for result in results:
        if hasattr(result, 'boxes') and result.boxes:
            for box in result.boxes.data:
                class_id = int(box[5])
                confidence = round(float(box[4]) * 100, 2)
                x1, y1, x2, y2 = map(int, box[:4])
                label = class_labels[class_id] if 0 <= class_id < len(class_labels) else 'Unknown'
                
                predictions.append({
                    'label': label,
                    'confidence': confidence,
                    'treatment': 'Consult a dermatologist for diagnosis.'
                })

                # Draw bounding box
                cv2.rectangle(image, (x1, y1), (x2, y2), (0, 165, 255), 2)  # Orange color

                # Draw label background
                label_text = f'{label} {confidence:.2f}%'
                (text_width, text_height), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                cv2.rectangle(image, (x1, y1 - text_height - 8), (x1 + text_width, y1), (0, 165, 255), -1)

                # Put text on top
                cv2.putText(image, label_text, (x1, y1 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)

    result_filename = f"{secrets.token_hex(8)}.jpg"
    result_path = os.path.join(app.config['RESULT_FOLDER'], result_filename)
    cv2.imwrite(result_path, image)
    return predictions, result_filename

# --- Routes ---
@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename = secure_filename(image_file.filename)
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image_file.save(image_path)

    results = model.predict(image_path)
    predictions, result_image = draw_boxes(results, image_path)

    prediction_json = json.dumps(predictions)
    prediction = Prediction(
        filename=filename,
        json_result=prediction_json,
        image_path=image_path
    )
    db.session.add(prediction)
    db.session.commit()

    json_path = os.path.join(app.config['JSON_FOLDER'], f"{filename.split('.')[0]}.json")
    with open(json_path, 'w') as json_file:
        json.dump(predictions, json_file)

    return jsonify({
        'filename': filename,
        'result_image': result_image,
        'predictions': predictions
    })

@app.route('/history', methods=['GET'])
def history():
    predictions = Prediction.query.order_by(Prediction.timestamp.desc()).all()
    history = [{
        'filename': p.filename,
        'json_result': json.loads(p.json_result),
        'image_path': f"/static/uploads/{p.filename}",
        'json_path': f"/static/json/{p.filename.split('.')[0]}.json",
        'timestamp': p.timestamp.isoformat()
    } for p in predictions]
    return jsonify(history)

@app.route('/static/<path:filename>')
def serve_static_file(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    app.run(debug=True)
