import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
# Prefer Service Role Key for backend scripts to bypass RLS
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Supabase URL and Key must be set in .env")

supabase: Client = create_client(url, key)

def get_user_by_telegram_id(telegram_id):
    """Fetch user by Telegram ID."""
    response = supabase.table("users").select("*").eq("telegram_chat_id", telegram_id).execute()
    if response.data:
        return response.data[0]
    return None

def link_telegram_user(email, telegram_id):
    """Link a Telegram ID to a CRM user by email."""
    # First check if user exists
    response = supabase.table("users").select("*").eq("email", email).execute()
    if not response.data:
        return False, "User not found with this email."
    
    user = response.data[0]
    
    # Update user with telegram_id
    supabase.table("users").update({"telegram_chat_id": telegram_id}).eq("id", user['id']).execute()
    return True, user

def update_user_timezone(user_id, timezone):
    """Update user's timezone."""
    response = supabase.table("users").update({"timezone": timezone}).eq("id", user_id).execute()
    return response.data

def get_workflows(user_id):
    """Fetch workflows for a user."""
    # Fetch workflows where user is creator or member
    # For simplicity, let's just fetch all workflows for now or filter by creator if RLS allows
    # Better: fetch from workflow_members if possible, or just all public ones?
    # Let's try fetching all workflows the user has access to.
    # Since we use service role key, we see everything. We should filter by user_id manually if needed.
    # But for now, let's assume the user wants to see workflows they are part of.
    
    # Option 1: Get workflows created by user
    created = supabase.table("workflows").select("*").eq("creator_id", user_id).execute()
    
    # Option 2: Get workflows where user is a member
    member_of = supabase.table("workflow_members").select("workflow_id").eq("user_id", user_id).execute()
    member_workflow_ids = [m['workflow_id'] for m in member_of.data]
    
    workflows = created.data
    if member_workflow_ids:
        member_workflows = supabase.table("workflows").select("*").in_("id", member_workflow_ids).execute()
        # Merge and deduplicate
        existing_ids = {w['id'] for w in workflows}
        for w in member_workflows.data:
            if w['id'] not in existing_ids:
                workflows.append(w)
                
    return workflows

def get_contacts(user_id=None, workflow_id=None):
    query = supabase.table("contacts").select("*")
    if user_id:
        query = query.eq("user_id", user_id)
    
    if workflow_id and workflow_id != "None":
        query = query.eq("workflow_id", workflow_id)
    else:
        # If workflow_id is explicitly None or "None" (MY TURF), filter for NULL
        # But only if user_id is set, otherwise we might be fetching broadly (though user_id is usually set)
        if user_id:
            query = query.is_("workflow_id", "null")
            
    response = query.execute()
    return response.data

def add_contact(contact_data, user_id=None, workflow_id=None):
    """Add a new contact."""
    final_user_id = user_id or os.environ.get("SUPABASE_USER_ID")
    if final_user_id:
        contact_data["user_id"] = final_user_id
    
    if workflow_id and workflow_id != "None":
        contact_data["workflow_id"] = workflow_id
        
    response = supabase.table("contacts").insert(contact_data).execute()
    return response.data

def get_deals(user_id=None, workflow_id=None):
    query = supabase.table("deals").select("*")
    if user_id:
        query = query.eq("user_id", user_id)
        
    if workflow_id and workflow_id != "None":
        query = query.eq("workflow_id", workflow_id)
    else:
        if user_id:
            query = query.is_("workflow_id", "null")
            
    response = query.execute()
    return response.data

def get_tasks(user_id=None, include_completed=False, workflow_id=None):
    query = supabase.table("tasks").select("*")
    if user_id:
        query = query.eq("user_id", user_id)
    if not include_completed:
        query = query.eq("completed", False)
        
    if workflow_id and workflow_id != "None":
        query = query.eq("workflow_id", workflow_id)
    else:
        if user_id:
            query = query.is_("workflow_id", "null")
            
    response = query.execute()
    return response.data

def add_task(task_data, user_id=None, workflow_id=None):
    """Add a new task."""
    final_user_id = user_id or os.environ.get("SUPABASE_USER_ID")
    if final_user_id:
        task_data["user_id"] = final_user_id
        
    if workflow_id and workflow_id != "None":
        task_data["workflow_id"] = workflow_id
        
    response = supabase.table("tasks").insert(task_data).execute()
    return response.data

def update_task(task_id, updates):
    response = supabase.table("tasks").update(updates).eq("id", task_id).execute()
    return response.data

def delete_task(task_id):
    response = supabase.table("tasks").delete().eq("id", task_id).execute()
    return response.data

def get_events(user_id=None, workflow_id=None):
    query = supabase.table("events").select("*")
    if user_id:
        query = query.eq("user_id", user_id)
        
    if workflow_id and workflow_id != "None":
        query = query.eq("workflow_id", workflow_id)
    else:
        if user_id:
            query = query.is_("workflow_id", "null")
            
    response = query.execute()
    return response.data

def get_debts(user_id=None, workflow_id=None):
    query = supabase.table("debts").select("*")
    if user_id:
        query = query.eq("user_id", user_id)
        
    if workflow_id and workflow_id != "None":
        query = query.eq("workflow_id", workflow_id)
    else:
        if user_id:
            query = query.is_("workflow_id", "null")
            
    response = query.execute()
    return response.data

def update_contact(contact_id, updates):
    response = supabase.table("contacts").update(updates).eq("id", contact_id).execute()
    return response.data

def delete_contact(contact_id):
    response = supabase.table("contacts").delete().eq("id", contact_id).execute()
    return response.data

def update_deal(deal_id, updates):
    response = supabase.table("deals").update(updates).eq("id", deal_id).execute()
    return response.data

def delete_deal(deal_id):
    response = supabase.table("deals").delete().eq("id", deal_id).execute()
    return response.data

def update_debt(debt_id, updates):
    response = supabase.table("debts").update(updates).eq("id", debt_id).execute()
    return response.data

def delete_debt(debt_id):
    response = supabase.table("debts").delete().eq("id", debt_id).execute()
    return response.data
