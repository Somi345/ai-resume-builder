from flask import Flask, request, jsonify

from dotenv import load_dotenv
import os

from routes.api import api_bp

# Load environment variables
import re
from flask_cors import CORS

app = Flask(__name__)

# Register blueprints BEFORE applying CORS as requested
app.register_blueprint(api_bp, url_prefix='/api')

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:8000"]
        }
    }
)

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "AI Resume Builder API is running"}), 200


if __name__ == '__main__':
    # Ensure environment variables are loaded, especially GEMINI_API_KEY
    if not os.getenv("GEMINI_API_KEY"):
        print("WARNING: GEMINI_API_KEY is not set in .env file. AI features will fallback.")
    
    print("Registered Routes:")
    print(app.url_map)
    
    app.run(debug=True, port=5000)
