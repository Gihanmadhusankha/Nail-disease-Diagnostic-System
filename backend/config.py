import logging
import os
import secrets
from dotenv import load_dotenv

load_dotenv()


class Config:
    UPLOAD_FOLDER = 'static/uploads'
    RESULT_FOLDER = 'static/results'
    JSON_FOLDER = 'static/json'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
    SQLALCHEMY_DATABASE_URI = 'sqlite:///predictions.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', secrets.token_hex(16))
    MODEL_PATH = os.getenv('MODEL_PATH', 'model/trained_weights/nail_disease_model/weights/best.pt')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    KNOWLEDGE_BASE_PATH = 'knowledge_base.txt'


def configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s: %(message)s',
        handlers=[logging.StreamHandler()],
    )


def ensure_directories(app) -> None:
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['RESULT_FOLDER'], exist_ok=True)
    os.makedirs(app.config['JSON_FOLDER'], exist_ok=True)
