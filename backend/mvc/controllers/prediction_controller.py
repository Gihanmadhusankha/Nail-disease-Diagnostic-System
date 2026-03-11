import json
import os

from flask import current_app, request, send_from_directory
from werkzeug.utils import secure_filename

from extensions import db
from mvc.models import Prediction
from mvc.views.api_response import error, success
from services.detection_service import allowed_file, draw_boxes


def predict_controller():
    if 'image' not in request.files:
        return error('No image provided', 400)

    image_file = request.files['image']
    if image_file.filename == '':
        return error('No file selected', 400)

    if not allowed_file(image_file.filename, current_app.config['ALLOWED_EXTENSIONS']):
        return error('Invalid file type', 400)

    filename = secure_filename(image_file.filename)
    image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    image_file.save(image_path)

    model = current_app.extensions.get('yolo_model')
    results = model.predict(image_path)
    predictions, result_image = draw_boxes(results, image_path, current_app.config['RESULT_FOLDER'])

    prediction_json = json.dumps(predictions)
    prediction = Prediction(
        filename=filename,
        json_result=prediction_json,
        image_path=image_path,
    )
    db.session.add(prediction)
    db.session.commit()

    json_path = os.path.join(current_app.config['JSON_FOLDER'], f"{filename.split('.')[0]}.json")
    with open(json_path, 'w', encoding='utf-8') as json_file:
        json.dump(predictions, json_file)

    return success({
        'filename': filename,
        'result_image': result_image,
        'predictions': predictions,
    })


def history_controller():
    predictions = Prediction.query.order_by(Prediction.timestamp.desc()).all()
    history_items = [
        {
            'filename': item.filename,
            'json_result': json.loads(item.json_result),
            'image_path': f"/static/uploads/{item.filename}",
            'json_path': f"/static/json/{item.filename.split('.')[0]}.json",
            'timestamp': item.timestamp.isoformat(),
        }
        for item in predictions
    ]
    return success(history_items)


def static_file_controller(filename: str):
    return send_from_directory('static', filename)
