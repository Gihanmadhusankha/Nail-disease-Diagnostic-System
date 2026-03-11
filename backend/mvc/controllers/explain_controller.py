from flask import current_app

from mvc.views.api_response import error, success
from services.explanation_service import generate_explanation


def explain_disease_controller(disease_name: str):
    try:
        llm = current_app.extensions.get('llm')
        knowledge_base_content = current_app.extensions.get('knowledge_base_content', '')

        if not llm:
            return error('AI service not configured. Please add GEMINI_API_KEY to .env', 503)

        explanation_text = generate_explanation(llm, disease_name, knowledge_base_content)
        return success({
            'disease': disease_name,
            'explanation': explanation_text,
            'source': 'AI-generated with medical knowledge base',
        })
    except Exception as exc:
        current_app.logger.error(f"Error generating explanation: {exc}")
        return error(f'Failed to generate explanation: {str(exc)}', 500)
