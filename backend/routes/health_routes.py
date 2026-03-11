from flask import Blueprint, current_app, jsonify


health_api = Blueprint('health_api', __name__)


@health_api.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@health_api.route('/health/routes', methods=['GET'])
def health_routes():
    routes = sorted(str(rule) for rule in current_app.url_map.iter_rules())
    return jsonify({'routes': routes})
