from flask import jsonify


def success(payload: dict, status_code: int = 200):
    return jsonify(payload), status_code


def error(message: str, status_code: int = 400):
    return jsonify({'error': message}), status_code
