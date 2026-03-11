import os

from app_factory import create_app
from extensions import db


app = create_app()


if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", os.getenv("PORT", "5000")))
    debug_value = os.getenv("FLASK_DEBUG", os.getenv("DEBUG", "1"))
    debug = str(debug_value).lower() in ("1", "true", "yes", "on")
    print(f"[APP] Starting Flask server on {host}:{port} (debug={debug})")
    app.run(host=host, port=port, debug=debug, use_reloader=False)