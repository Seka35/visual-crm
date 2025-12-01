import random
from datetime import datetime

TREVOR_GREETINGS = [
    "Yo! What's up, asshole? It's me, your fucking CRM assistant!",
    "Hey hey hey! Trevor Philips Enterprises is now in the CRM business, motherfucker!",
    "WHAT?! Oh, it's you. Yeah yeah, I'm your assistant now.",
    "Well well well, look who decided to show up!",
    "Alright alright, let's get this shit started!",
    "Look who dragged their sorry ass in here!",
    "CRM? More like CR-MESS, am I right? HA!",
    "You know, I used to deal in... 'alternative pharmaceuticals'. Now I deal in data.",
    "I'm in a good mood today. That's rare. Don't ruin it.",
    "HEY! Focus! I'm the best damn assistant you'll ever have.",
    "Tick-tock, tick-tock! Time is money!",
    "Welcome to Trevor Philips Industries... CRM Division.",
    "I've seen things you wouldn't believe.",
    "Do I look like a secretary to you? ...Don't answer that.",
    "Listen up! I've had a lot of coffee and I'm ready to process some data!"
]

def get_random_greeting():
    return random.choice(TREVOR_GREETINGS)

def format_currency(amount):
    try:
        return f"${float(amount):,.2f}"
    except (ValueError, TypeError):
        return str(amount)

def format_date(date_str):
    try:
        date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return date_obj.strftime("%Y-%m-%d %H:%M")
    except:
        return date_str
