from flask import Flask
from flask_cors import CORS

from config import Config, configure_logging, ensure_directories
from extensions import build_llm, db
from routes import explain_api, health_api, prediction_api
from services.detection_service import load_model
from services.explanation_service import load_knowledge_base


def create_app():
    print('[APP] Starting Flask app initialization...')
    configure_logging()

    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={r'/*': {'origins': 'http://localhost:5173'}})

    ensure_directories(app)
    db.init_app(app)

    print('[APP] Loading YOLO model...')
    model = load_model(app.config['MODEL_PATH'])
    app.extensions['yolo_model'] = model
    app.logger.info(f"✅ YOLO model loaded from {app.config['MODEL_PATH']}")

    print('[APP] Configuring Gemini API...')
    llm = build_llm(app.config.get('GEMINI_API_KEY'))
    app.extensions['llm'] = llm
    if llm:
        print('[APP] ✅ Gemini API configured with gemini-2.5-flash')
    else:
        print('[APP] ⚠️ GEMINI_API_KEY not found or invalid')

    try:
        knowledge_base_content = load_knowledge_base(app.config['KNOWLEDGE_BASE_PATH'])
        app.extensions['knowledge_base_content'] = knowledge_base_content
        print(f"[APP] ✅ Knowledge base loaded ({len(knowledge_base_content)} chars)")
    except Exception as exc:
        app.extensions['knowledge_base_content'] = ''
        print(f"[APP] ⚠️ Could not load knowledge base: {exc}")

    import mvc.models  # noqa: F401

    with app.app_context():
        db.create_all()

    app.register_blueprint(prediction_api)
    app.register_blueprint(explain_api)
    app.register_blueprint(health_api)
    print('[APP] Database initialized')
    return app
