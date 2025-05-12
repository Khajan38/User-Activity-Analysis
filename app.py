import os
from flask_cors import CORS
from flask import Flask, jsonify
from backend.meetings_data import meetings_bp
from backend.user_state import  login_bp, logout_bp, refresh_bp
from backend.setup import initializeAPI, trainModels, downloadNLTKSpacy

app = Flask(__name__)
CORS(app, origins="*")
initializeAPI()
downloadNLTKSpacy()
trainModels()

app.register_blueprint(login_bp, url_prefix='/api')
app.register_blueprint(logout_bp, url_prefix='/api')
app.register_blueprint(refresh_bp, url_prefix='/api')
app.register_blueprint(meetings_bp, url_prefix='/api')

@app.route('/api', methods=['POST'])
def initial():
    initializeAPI()
    return jsonify({"message": "Initial state - example@gmail.com"}), 201

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)