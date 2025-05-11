from flask import Flask
from flask_cors import CORS
from meetings_data import meetings_bp
from user_state import  login_bp, logout_bp, refresh_bp
from setup import initializeAPI, trainModels, downloadNLTKSpacy

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])
trainModels()
initializeAPI()
downloadNLTKSpacy()

app.register_blueprint(login_bp, url_prefix='/api')
app.register_blueprint(logout_bp, url_prefix='/api')
app.register_blueprint(refresh_bp, url_prefix='/api')
app.register_blueprint(meetings_bp, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)