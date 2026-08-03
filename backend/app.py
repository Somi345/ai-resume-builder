from flask import Flask, jsonify
from dotenv import load_dotenv
import os
from flask_cors import CORS

from routes.api import api_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Register API routes
app.register_blueprint(api_bp, url_prefix="/api")

# Enable CORS
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    }
)

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "message": "AI Resume Builder API is running"
    }), 200


if __name__ == "__main__":
    # Check API key
    if not os.getenv("GEMINI_API_KEY"):
        print("WARNING: GEMINI_API_KEY is not set. AI features may not work.")

    print("Registered Routes:")
    print(app.url_map)

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=True
    )
