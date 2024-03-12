import math
from flask import request

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
    message = "You are wasting money each week/month that would eventually add up to a visit to the cinema or a cozy diner at a nice restaurant"

  # 100 - 200
  elif total_cost >= 100 and total_cost <= 200:
    message = "That is about the cost of a Netflix subscription and/or Spotify Premium, or a visit to the cinema with friends"
  
  # >200
  else:
    message = "You are wasting more than a Netflix subscription and/or Spotify Premium, or other services"

  return message