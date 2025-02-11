from flask import Flask
from config.settings import FLASK_SECRET_KEY
from api.survey_routes import survey_bp
from api.summary_routes import summary_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/ai/*": {
    "origins": ["http://localhost:3000", "https://collabit.site"],
    "methods": ["GET", "POST", "PUT", "DELETE"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})
app.secret_key = FLASK_SECRET_KEY

# Register blueprints
app.register_blueprint(survey_bp)
app.register_blueprint(summary_bp)

if __name__ == "__main__":
    app.run(debug=True)