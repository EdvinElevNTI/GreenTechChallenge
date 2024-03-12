# from flask import Flask, jsonify, render_template, request, redirect, url_for
# import threading
# import time
# from datetime import datetime, timedelta
# import subprocess
# from matsvinn_calc import calc_cost
# from matsvinn_calc import decide_message
# from expiration_list import List, warning_check
# import json

import random
import time
from datetime import datetime, timedelta
from threading import Thread, Lock
from flask import Flask, jsonify, render_template, request, redirect, url_for
from flask_socketio import SocketIO, emit
import traceback
import os
import threading
import time
import subprocess
from matsvinn_calc import calc_cost
from matsvinn_calc import decide_message
from expiration_list import List, warning_check
import json

# Initialize the Flask application.
app = Flask(__name__)

# Data and additional functions
warning_check_interval = 5  # 24 hours = 86400 seconds
# expiration_list = []
expiration_dict = {}
warnings = []
warning_days = 2
data = 0
nr = 1

def expiration_checker(): # Check for warnings in expiration_list every n seconds
  while True:
      warning_check(expiration_dict)
      time.sleep(warning_check_interval)

def safe_int(value, default=0):
    try:
        return int(value)
    except ValueError:
        return default

@app.route('/get_item/<int:key>')
def get_item(key):
    item = expiration_dict.get(key)
    if item is not None:
        return jsonify({
            'name': item.name,
            'year': item.year,
            'month': item.month,
            'day': item.day,
            'note': item.note,
            'warning_days': item.warning_days,
            'type': item.type,
            'expired': item.expired
        })
    else:
        return jsonify({'error': 'Invalid key'}), 400


# GET the routes for the application
@app.route("/")
def home():

  return render_template("index.html")


@app.route("/matsvinn")
def matsvinn():
  return render_template("matsvinn.html", expiration_dict=expiration_dict, warnings=warnings)



@app.route("/test")
def test():
  return render_template("test.html", expiration_dict=expiration_dict, warnings=warnings)

# POST requests
@app.route("/matsvinn_calc_post", methods=["POST"])
def calc_post():
  data = request.json
  bags = int(data['number'])  # Convert to int and into bags variable
  avg_weight = float(data['avg_weight'])
  result = str(calc_cost(bags, avg_weight)) + " kr"
  message = decide_message(bags, avg_weight)

  return jsonify(result=result, message=message)


@app.route('/matsvinn_exp_add_item', methods=['POST'])
def add_item():
  global nr # Make variable global

  name = request.form['name']
  year = int(request.form['year'])
  month = int(request.form['month'])
  day = int(request.form['day'])
  note = request.form['note']
  warning_days = int(request.form['warning_days'])
  type = request.form['type']

  new_item = List(name, year, month, day, note, warning_days, type)
  expiration_dict[nr] = new_item
  warning_check(expiration_dict)
  nr += 1
  
  return redirect(url_for('matsvinn'))

# Delete item
@app.route('/delete_item', methods=['POST'])
def delete_item():
    index = int(request.form.get('index', -1))

    # Delete if valid index
    if index != -1 and index in expiration_dict:
        del expiration_dict[index]
        return redirect(url_for('matsvinn'))  # Redirect to the matsvinn route
    
    # Return error otherwise
    else:
        return jsonify({'error': 'Invalid index'}), 400

# Edit item
@app.route('/edit_item', methods=['POST'])
def edit_item():
    index = int(request.form.get('index', -1)) # Set index to -1 if its empty to handle error
    new_name = request.form.get('new_name')
    new_year = request.form.get('new_year')
    new_month = request.form.get('new_month')
    new_day = request.form.get('new_day')
    new_note = request.form.get('new_note')
    new_warning_days = request.form.get('new_warning_days')
    new_type = request.form['new_type']

    # Check if valid index
    if index != -1 and index in expiration_dict:

       # Convert to integers
        new_year = int(new_year)
        new_month = int(new_month)
        new_day = int(new_day)
        print(new_year, new_month, new_day)
            
        # Update items in expiration_dict
        expiration_dict[index].name = new_name
        expiration_dict[index].year = new_year
        expiration_dict[index].month = new_month
        expiration_dict[index].day = new_day
        expiration_dict[index].note = new_note
        expiration_dict[index].warning_days = new_warning_days
        expiration_dict[index].type = new_type
        print(expiration_dict[index].type)
        print(expiration_dict[index].type)
        print(expiration_dict[index].type)
        warning_check(expiration_dict) # Check for warnings
        
        return redirect(url_for('matsvinn'))  # Redirect to the matsvinn route after editing
    
    # Return error otherwise
    else:
        return jsonify({'error': 'Invalid index'}), 400

# Assuming expiration_dict is a list of objects of some class
serialized_expiration_dict = json.dumps([item.__dict__ for item in expiration_dict])












































cost_lock = Lock()

cost1 = 6
cost2 = 3
cost3 = 0.3
cost4 = 0.5


climate_types = ["Climate Friendly", "Balanced Climate", "Price Worthy", "Price Price"]

cost_data_dict = {climate_type: [] for climate_type in climate_types}

start_time = datetime.now() - timedelta(hours=12)


# Initialize the start time to the current time
start_time = datetime.now()

def generate_cost_data():
    global cost1, cost2, cost3, cost4, start_time

    temp_cost1 = cost1 + random.uniform(-0.2, 0.2)
    temp_cost2 = cost2 + random.uniform(-0.26, 0.26)
    temp_cost3 = cost3 + random.uniform(-0.13, 0.13)
    temp_cost4 = cost4 + random.uniform(-0.8, 0.8)

    cost1 = temp_cost1 if temp_cost1 > 0 else cost1
    cost2 = temp_cost2 if temp_cost2 > 0 else cost2
    cost3 = temp_cost3 if temp_cost3 > 0 else cost3
    cost4 = temp_cost4 if temp_cost4 > 0 else cost4

    # Update the time
    
    time_str = start_time.strftime('%Y-%m-%d %H:%M:%S')

    # Update the cost data dict
    cost_data_dict["Climate Friendly"].append([time_str, cost1])
    cost_data_dict["Balanced Climate"].append([time_str, cost2])
    cost_data_dict["Price Worthy"].append([time_str, cost3])
    cost_data_dict["Price Price"].append([time_str, cost4])

    # Calculate the mean values
    mean_values = {
        "Climate Friendly": sum([data[1] for data in cost_data_dict["Climate Friendly"]]) / len(cost_data_dict["Climate Friendly"]),
        "Balanced Climate": sum([data[1] for data in cost_data_dict["Balanced Climate"]]) / len(cost_data_dict["Balanced Climate"]),
        "Price Worthy": sum([data[1] for data in cost_data_dict["Price Worthy"]]) / len(cost_data_dict["Price Worthy"]),
        "Price Worthy": sum([data[1] for data in cost_data_dict["Price Price"]]) / len(cost_data_dict["Price Price"]),
    }

    # Emit the updated mean values
    socketio.emit("mean_update", mean_values)

# Generate the initial 24 values
print("Starting loop")
for _ in range(24):
    start_time += timedelta(minutes=60)
    print(_)
    generate_cost_data()

def generate_cost(climate_type):
    with cost_lock:
        generate_cost_data()

        climateValues = {
            "Climate Friendly": cost1,
            "Balanced Climate": cost2,
            "Price Worthy": cost3,
            "Price Price": cost4,
        }
        return climateValues[climate_type]


def get_data_values():
    global start_time  # Add this line to access the global start_time variable
    while True:
        try:
            start_time += timedelta(minutes=60)  # Update the start_time variable once for each iteration
            time_str = start_time.strftime("%Y-%m-%d %H:%M:%S")  # Use the updated start_time variable
            for climate_type in climate_types: # runs this loop twice every 20 seconds
                result = generate_cost(climate_type)
                with cost_lock:
                    print(f"Adding {result} to {climate_type}")
                    cost_data_dict[climate_type].append([time_str, result])
                    # print(cost_data_dict)
                    # Ensure the list does not grow indefinitely
                    if len(cost_data_dict[climate_type]) > 24:
                        cost_data_dict[climate_type].pop(0)

                    print("Emitting cost_update")
                    socketio.emit(
                        "cost_update",
                        {"climate_type": climate_type, "cost": result, "time": time_str},
                    )

                
            time.sleep(5)
        except Exception as e:
            print(f"An error occurred in get_data_values: {e}")


@app.route("/")
def home():
    return render_template("index.html")

@app.route("/cost_data", methods=["GET"])
def cost_data():
    lastDataPointTime = request.args.get('lastDataPointTime')
    if lastDataPointTime is not None:
        lastDataPointTime = datetime.strptime(lastDataPointTime, '%Y-%m-%d %H:%M:%S')
        for climate_type in climate_types:
            cost_data_dict[climate_type] = [data for data in cost_data_dict[climate_type] if datetime.strptime(data[0], '%Y-%m-%d %H:%M:%S') > lastDataPointTime]
    return jsonify(cost_data_dict)

@app.route("/update_cost_data", methods=["POST"])
def update_cost_data():
    percentage = int(request.json["percentage"])
    percentage /= 100
    fc_price = 1 - percentage
    round(fc_price)
    fc_env = 1 - fc_price

    socketio.emit("update_graph", {"fc_env": fc_env, "fc_price": fc_price})


@socketio.on("get_cost_data")
def send_cost_data():
    emit("cost_data", cost_data_dict)
















# Main entry point for the application.
if __name__ == "__main__":
  # Start the expiration checker in a separate thread
  expiration_thread = threading.Thread(target=expiration_checker)
  expiration_thread.start()

  # socket io thread
  data_thread = Thread(target=get_data_values)
  data_thread.start()
  socketio.run(app, debug=True, use_reloader=False)

  # Start Flask application with debugging enabled on port 5000
  app.run(host='0.0.0.0', port=5000, debug=True)