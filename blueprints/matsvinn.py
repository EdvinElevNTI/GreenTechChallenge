from flask import Flask, jsonify, render_template, request, redirect, url_for, Blueprint
import threading
import time
from datetime import datetime, timedelta
import subprocess
import json

# Initialize the Flask application.
matsvinn_bp = Blueprint('matsvinn', __name__)

# Data and additional functions
warning_check_interval = 5  # 24 hours = 86400 seconds
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

@matsvinn_bp.route('/get_item/<int:key>')
def get_item(key):
    item = expiration_dict.get(key)
    if item is not None:
        return jsonify({
            'name': item.name,
            'expiration_date': item.expiration_date,
            'note': item.note,
            'warning_days': item.warning_days,
            'warning' : item.warning,
            'type': item.type,
            'expired': item.expired
        })
    else:
        return jsonify({'error': 'Invalid key'}), 400


class List:
    def __init__(self, name, expiration_date, note, warning_days, type):
        self.name = name
        self.expiration_date = expiration_date
        self.note = note
        self.warning_days = warning_days
        self.type = type
        self.warning = None  # For potential warnings, starts empty
        self.expired = False  # For potential expired items, starts False

    # Function to calculate the number of days until expiration
    def expiry_days(self):
        item_date = self.expiration_date
        current_date = datetime.now()
        difference = current_date - item_date
        return difference

def warning_check(expiration_dict):
    current_date = datetime.now()
  
    for key, item in expiration_dict.items():  # Iterate over key-value pairs

        difference = item.expiry_days()
        warning_days = int(item.warning_days)
        warning_days *= -1  # Convert to negative

        # If expired
        if difference.days > 0:
            item.expired = True
            item.warning = f"Expired: {item.name} expired on {item.expiration_date.strftime('%Y-%m-%d')} ({item.note})"

        # If about to expire
        elif 0 >= difference.days >= warning_days:
            item.expired = False
            item.warning = f"Warning: {item.name} expires soon on {item.expiration_date.strftime('%Y-%m-%d')} ({item.note})"

        # If no warning
        else:
            item.expired = False
            item.warning = None

# Estimated procentual amount in bag of each category
meat_p = 0.28
harvest_p = 0.47
veggies_p = 0.25

# Average cost per kilo (kr)
meat_c = 108
harvest_c = 30
veggies_c = 50

# Calculate estimated wasted money and round to whole number
def calc_cost(bags, avg_weight):
  total_cost = bags * ((meat_c * meat_p) + (harvest_c * harvest_p) +
                       (veggies_c * veggies_p)) * avg_weight
  total_cost = round(total_cost)

  return total_cost

# Decide the message
def decide_message(bags, avg_weight):
  
  total_cost = calc_cost(bags, avg_weight)

  # <100
  if total_cost < 100:
    message = "Du slösar pengar (varje vecka/månad/etc.) som tillslut kan bli ett biobesök eller en mysig middag på en restaurang"

  # 100 - 200
  elif total_cost >= 100 and total_cost <= 200:
    message = "Det är ungefär kostnaden för en Netflix prenumeration och/eller Spotify Premium, eller ett besök på bio med vänner"
  
  # >200
  else:
    message = "Du slösar ungefär kostnaden för " + str(round(total_cost/109)) + " Netflix eller Spotify Premium prenumerationer, eller andra tjänster"

  return message

# GET the routes for the application
@matsvinn_bp.route("/matsvinn")
def matsvinn():
  return render_template("matsvinn/matsvinn.html", expiration_dict=expiration_dict, warnings=warnings)



@matsvinn_bp.route("/test")
def test():
  return render_template("test.html", expiration_dict=expiration_dict, warnings=warnings)

# POST requests
@matsvinn_bp.route("/matsvinn_calc_post", methods=["POST"])
def calc_post():
  data = request.json
  bags = int(data['number'])  # Convert to int and into bags variable
  avg_weight = float(data['avg_weight'])
  result = str(calc_cost(bags, avg_weight)) + " kr"
  message = decide_message(bags, avg_weight)

  return jsonify(result=result, message=message)


@matsvinn_bp.route('/matsvinn_exp_add_item', methods=['POST'])
def add_item():
  global nr # Make variable global

  name = request.form['name']
  expiration_date = datetime.strptime(request.form['expiration_date'], '%Y-%m-%d')
  note = request.form['note']
  warning_days = int(request.form['warning_days'])
  type = request.form['type']

  new_item = List(name, expiration_date, note, warning_days, type)
  expiration_dict[nr] = new_item
  warning_check(expiration_dict)
  nr += 1
  
  return redirect(url_for('matsvinn.matsvinn'))

# Delete item
@matsvinn_bp.route('/delete_item', methods=['POST'])
def delete_item():
    index = int(request.form.get('index', -1))

    # Delete if valid index
    if index != -1 and index in expiration_dict:
        del expiration_dict[index]
        return redirect(url_for('matsvinn.matsvinn'))  # Redirect to the matsvinn route
    
    # Return error otherwise
    else:
        return jsonify({'error': 'Invalid index'}), 400

# Edit item
@matsvinn_bp.route('/edit_item', methods=['POST'])
def edit_item():
    index = int(request.form.get('index', -1)) # Set index to -1 if its empty to handle error
    new_name = request.form.get('new_name')
    new_expiration_date = request.form.get('new_expiration_date')
    new_note = request.form.get('new_note')
    new_warning_days = request.form.get('new_warning_days')
    new_type = request.form['new_type']

    # Check if valid index
    if index != -1 and index in expiration_dict:

        new_expiration_date = datetime.strptime(request.form.get('new_expiration_date'), '%Y-%m-%d')
            
        # Update items in expiration_dict
        expiration_dict[index].name = new_name
        expiration_dict[index].expiration_date = new_expiration_date
        expiration_dict[index].note = new_note
        expiration_dict[index].warning_days = new_warning_days
        expiration_dict[index].type = new_type
        print(expiration_dict[index].type)
        print(expiration_dict[index].type)
        print(expiration_dict[index].type)
        warning_check(expiration_dict) # Check for warnings
        
        return redirect(url_for('matsvinn.matsvinn'))  # Redirect to the matsvinn route after editing
    
    # Return error otherwise
    else:
        return jsonify({'error': 'Invalid index'}), 400


# Assuming expiration_dict is a list of objects of some class
serialized_expiration_dict = json.dumps([item.__dict__ for item in expiration_dict])