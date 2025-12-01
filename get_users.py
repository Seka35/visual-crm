import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()
load_dotenv("bot_telegram/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set.")
    exit(1)

supabase = create_client(url, key)

try:
    # Try to fetch users from auth.users (admin only)
    # Note: supabase-py admin client usage might differ, let's try listing from a public table if auth fails
    # But we have service role key, so we should be able to list users via admin api if supported, 
    # or just query the 'users' table if it exists in public schema (which is common in these templates)
    
    print("Attempting to fetch from public.users...")
    response = supabase.table("users").select("*").execute()
    users = response.data
    
    if users:
        print(f"Found {len(users)} users in public.users:")
        for user in users:
            print(f"ID: {user.get('id')}, Email: {user.get('email')}, Name: {user.get('full_name') or user.get('name')}")
    else:
        print("No users found in public.users.")
        
except Exception as e:
    print(f"Error: {e}")
