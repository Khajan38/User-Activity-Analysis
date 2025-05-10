from flask import Flask
from flask_cors import CORS
from meetings_data import meetings_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(meetings_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)