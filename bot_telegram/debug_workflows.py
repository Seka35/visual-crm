from db import supabase

def debug_workflows():
    # 1. Fetch all users
    users = supabase.table("users").select("*").execute().data
    print(f"Found {len(users)} users.")
    
    for user in users:
        print(f"\nUser: {user.get('email')} (ID: {user.get('id')})")
        
        # 2. Fetch workflows created by user
        created = supabase.table("workflows").select("*").eq("creator_id", user['id']).execute().data
        print(f"  Created Workflows ({len(created)}):")
        for w in created:
            print(f"    - {w.get('name')} (ID: {w.get('id')})")
            
        # 3. Fetch workflows where user is a member
        member_of = supabase.table("workflow_members").select("workflow_id").eq("user_id", user['id']).execute().data
        print(f"  Member of Workflows ({len(member_of)}):")
        for m in member_of:
            # Fetch workflow details
            w = supabase.table("workflows").select("*").eq("id", m['workflow_id']).execute().data
            if w:
                print(f"    - {w[0].get('name')} (ID: {w[0].get('id')})")
            else:
                print(f"    - Unknown Workflow (ID: {m['workflow_id']})")

        # 4. Check for tasks with NULL workflow_id (MY TURF)
        null_workflow_tasks = supabase.table("tasks").select("id").eq("user_id", user['id']).is_("workflow_id", "null").execute().data
        print(f"  Tasks in 'MY TURF' (workflow_id=None): {len(null_workflow_tasks)}")

if __name__ == "__main__":
    debug_workflows()
