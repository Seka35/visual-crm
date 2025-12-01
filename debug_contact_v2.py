import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
load_dotenv("bot_telegram/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(url, key)

print("--- SEARCHING FOR BOB ---")
try:
    response = supabase.table("contacts").select("*").ilike("name", "%Bob%").execute()
    if response.data:
        for c in response.data:
            print(f"FOUND BOB: Name={c['name']}, UserID={c['user_id']}")
    else:
        print("Bob NOT found.")
except Exception as e:
    print(f"Error searching Bob: {e}")

print("\n--- ALL USERS ---")
try:
    response = supabase.table("users").select("*").execute()
    for u in response.data:
        print(f"User: {u.get('email')} | ID: {u.get('id')}")
except Exception as e:
    print(f"Error listing users: {e}")
