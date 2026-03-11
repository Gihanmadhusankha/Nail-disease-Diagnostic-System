import datetime

from extensions import db


class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    json_result = db.Column(db.Text, nullable=False)
    image_path = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)
