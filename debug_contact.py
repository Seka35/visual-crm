import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
load_dotenv("bot_telegram/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.")
    exit(1)

supabase = create_client(url, key)

print("--- USERS ---")
try:
    response = supabase.table("users").select("*").execute()
    for user in response.data:
        print(f"ID: {user.get('id')} | Email: {user.get('email')} | Name: {user.get('full_name') or user.get('name')}")
except Exception as e:
    print(f"Error fetching users: {e}")

print("\n--- RECENT CONTACTS ---")
try:
    # Fetch last 5 contacts, ordered by created_at desc if available, or just list all
    response = supabase.table("contacts").select("*").order("created_at", desc=True).limit(5).execute()
    for contact in response.data:
        print(f"Name: {contact.get('name')} | Company: {contact.get('company')} | User ID: {contact.get('user_id')}")
except Exception as e:
    print(f"Error fetching contacts: {e}")
