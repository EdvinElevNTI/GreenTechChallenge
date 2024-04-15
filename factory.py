from flask import Flask, render_template
from blueprints import chart_bp, about_bp, elpris_bp, matsvinn_bp, setup_chart_socketio, setup_elpris_socketio
from flask_socketio import SocketIO


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'secret!'
    app.register_blueprint(chart_bp)
    app.register_blueprint(about_bp)
    app.register_blueprint(elpris_bp)
    app.register_blueprint(matsvinn_bp)
    socketio = SocketIO(app)
    
    setup_chart_socketio(socketio)
    setup_elpris_socketio(socketio)

    @app.route("/", methods=["GET"])
    def home():
        return render_template("base.html")


    return socketio, app
