import os
from dotenv import load_dotenv
from supabase import create_client

# Load envs like main.py
root_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(root_env_path)
load_dotenv('bot_telegram/.env')

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

print(f"SUPABASE_URL found: {bool(url)}")
print(f"SUPABASE_KEY found: {bool(key)}")
print(f"SUPABASE_SERVICE_ROLE_KEY found: {bool(service_key)}")

if not url:
    print("CRITICAL: SUPABASE_URL is missing.")
    exit()

# Try with available key
use_key = service_key or key
print(f"Using key: {'SERVICE_ROLE' if use_key == service_key else 'ANON/PUBLIC'}")

try:
    supabase = create_client(url, use_key)
    print("Attempting to fetch tasks...")
    response = supabase.table("tasks").select("*").execute()
    print(f"Success! Found {len(response.data)} tasks.")
    if len(response.data) == 0:
        print("WARNING: 0 tasks found. If you have tasks in the app, this confirms RLS is blocking access.")
except Exception as e:
    print(f"Error connecting to DB: {e}")
