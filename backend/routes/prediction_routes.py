from flask import Blueprint

from mvc.controllers.prediction_controller import (
    history_controller,
    predict_controller,
    static_file_controller,
)


prediction_api = Blueprint('prediction_api', __name__)


@prediction_api.route('/predict', methods=['POST'])
def predict():
    return predict_controller()


@prediction_api.route('/history', methods=['GET'])
def history():
    return history_controller()


@prediction_api.route('/static/<path:filename>')
def serve_static_file(filename):
    return static_file_controller(filename)
