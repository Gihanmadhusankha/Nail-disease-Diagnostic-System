from flask import Blueprint

from mvc.controllers.explain_controller import explain_disease_controller


explain_api = Blueprint('explain_api', __name__)


@explain_api.route('/explain/<disease_name>', methods=['GET'])
@explain_api.route('/api/explain/<disease_name>', methods=['GET'])
def explain_disease(disease_name):
    return explain_disease_controller(disease_name)
