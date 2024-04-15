from flask import Blueprint, render_template
import random

from time import sleep



chart_bp = Blueprint('chart', __name__)


@chart_bp.get("/chart")
def chart():
    return render_template("chart/chart.html")

def setup_chart_socketio(socketio):

    def random_value_emitter():
        while True:
            random_value = random.random()
            socketio.emit('random value', {'data': random_value})
            sleep(5)

    socketio.start_background_task(random_value_emitter)
 