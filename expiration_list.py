from datetime import datetime

class List:
    def __init__(self, name, year, month, day, note, warning_days, type):
        self.name = name
        self.year = year
        self.month = month
        self.day = day
        self.note = note
        self.warning_days = warning_days
        self.type = type
        self.warning = None  # For potential warnings, starts empty
        self.expired = False  # For potential expired items, starts False

    # Function to calculate the number of days until expiration
    def expiry_days(self):
        item_date = datetime(self.year, self.month, self.day)
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
            item.warning = f"Expired: {item.name} expired on {item.year}-{item.month}-{item.day} ({item.note})"

        # If about to expire
        elif 0 >= difference.days >= warning_days:
            item.expired = False
            item.warning = f"Warning: {item.name} expires soon on {item.year}-{item.month}-{item.day} ({item.note})"

        # If no warning
        else:
            item.expired = False
            item.warning = None