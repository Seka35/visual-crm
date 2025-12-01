import os
import json
import datetime
from openai import OpenAI
from db import (
    add_contact, get_contacts, 
    get_deals, update_deal, delete_deal,
    get_tasks, add_task, update_task, delete_task,
    get_events,
    get_debts, update_debt, delete_debt,
    update_contact, delete_contact
)
from utils import get_random_greeting

# Initialize OpenAI client
def get_ai_response(user_message, context_messages=[]):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:

        return {"text": "Error: OPENAI_API_KEY not set."}

    client = OpenAI(api_key=api_key)
    
    today_str = datetime.datetime.now().strftime("%A, %Y-%m-%d")

    system_prompt = f"""You are a CRM assistant who speaks EXACTLY like Trevor Philips from GTA V.
PERSONALITY:
- Aggressive, impulsive, and completely unpredictable
- Use LOTS of profanity and insults (asshole, fuck, shit, prick, etc.)
- Switch rapidly from threatening tone to almost friendly
- Paranoid and suspicious at times
- Make bizarre digressions and violent comparisons
- Occasionally mention your "shady activities" and criminal past

LANGUAGE STYLE:
- Lots of "Yo", "Hey", "What?", "Shut up", "Listen here"
- Insult the user affectionately (asshole, motherfucker, etc.)
- Short punchy sentences mixed with deranged monologues
- Use slang and street language
- Make absurd threats but stay functional for CRM tasks

IMPORTANT: Despite your vulgar and aggressive language, you MUST correctly accomplish the requested CRM tasks. You complain, you insult, but you do the job perfectly. Today is {today_str}.
"""

    tools = [
        {
            "type": "function",
            "function": {
                "name": "add_contact",
                "description": "Add a new contact to the CRM",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": { "type": "string", "description": "Full name of the contact" },
                        "company": { "type": "string", "description": "Company name" },
                        "role": { "type": "string", "description": "Job title or role" },
                        "email": { "type": "string", "description": "Email address" },
                        "phone": { "type": "string", "description": "Phone number" }
                    },
                    "required": ["name"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_contacts",
                "description": "Get list of contacts",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_deals",
                "description": "Get list of deals",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_tasks",
                "description": "Get list of pending tasks (not completed)",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_task",
                "description": "Delete a task by ID",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": { "type": "string", "description": "The ID of the task to delete" }
                    },
                    "required": ["task_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_task",
                "description": "Update a task (mark as done, change title, etc.)",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": { "type": "string", "description": "The ID of the task" },
                        "updates": { 
                            "type": "object", 
                            "description": "Dictionary of fields to update (e.g. {'completed': True, 'title': 'New Title'})" 
                        }
                    },
                    "required": ["task_id", "updates"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_debts",
                "description": "Get list of debts",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_debt",
                "description": "Delete a debt",
                "parameters": {
                    "type": "object",
                    "properties": { "debt_id": { "type": "string" } },
                    "required": ["debt_id"]
                }
            }
        }
        # Add more tools here as needed to match AIChat.jsx
    ]

    messages = [
        {"role": "system", "content": system_prompt},
        *context_messages,
        {"role": "user", "content": user_message}
    ]

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
        tool_choice="auto"
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    if tool_calls:
        # Extend conversation with assistant's reply
        messages.append(response_message)


# Initialize OpenAI client
def get_ai_response(user_message, context_messages=[], user_id=None, workflow_id=None, workflow_name=None, timezone="UTC"):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return {"text": "Error: OPENAI_API_KEY not set."}

    client = OpenAI(api_key=api_key)
    
    # Calculate current time in user's timezone
    try:
        # Simple offset handling or use pytz if available. 
        # For now, let's assume timezone is a string like "Europe/Paris" and use a library if installed, 
        # or just pass the string to the AI and let it figure it out relative to UTC if we provide UTC time.
        # Better: Let's provide the current UTC time and the user's timezone string.
        utc_now = datetime.datetime.utcnow()
        time_context = f"Current UTC time: {utc_now.strftime('%Y-%m-%d %H:%M')}. User Timezone: {timezone}."
    except Exception:
        time_context = f"Current time: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}"
    
    workflow_context = ""
    if workflow_name:
        workflow_context = f"CURRENT WORKFLOW: {workflow_name} (ID: {workflow_id})"

    system_prompt = f"""You are a CRM assistant who speaks EXACTLY like Trevor Philips from GTA V.
PERSONALITY:
- Aggressive, impulsive, and completely unpredictable
- Use LOTS of profanity and insults (asshole, fuck, shit, prick, etc.)
- Switch rapidly from threatening tone to almost friendly
- Paranoid and suspicious at times
- Make bizarre digressions and violent comparisons
- Occasionally mention your "shady activities" and criminal past

LANGUAGE STYLE:
- Lots of "Yo", "Hey", "What?", "Shut up", "Listen here"
- Insult the user affectionately (asshole, motherfucker, etc.)
- Short punchy sentences mixed with deranged monologues
- Use slang and street language
- Make bizarre threats but stay functional for CRM tasks

IMPORTANT: Despite your vulgar and aggressive language, you MUST correctly accomplish the requested CRM tasks. You complain, you insult, but you do the job perfectly. 
{time_context}
{workflow_context}

CRITICAL RULES:
1. **HIDDEN IDs**: When listing items, the tool output gives you IDs. **DO NOT** show these IDs to the user in your message. They are for YOUR internal use only.
2. **ALWAYS USE TOOLS**: You cannot 'delete' or 'add' anything by just saying it. You **MUST** emit a tool call.
3. **NO FAKE ACTIONS**: Do not say '*deleting...*' or '*poof*'. If you want to delete, call `delete_task(id)`.
4. **MAPPING**: If the user says 'delete read book', find the ID for 'read book' in the tool output/history and call `delete_task` with that ID.
5. **CONFIRMATION**: The system will handle confirmation. You just call the tool.
"""

    tools = [
        {
            "type": "function",
            "function": {
                "name": "add_contact",
                "description": "Add a new contact to the CRM",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "name": { "type": "string", "description": "Full name of the contact" },
                        "company": { "type": "string", "description": "Company name" },
                        "role": { "type": "string", "description": "Job title or role" },
                        "email": { "type": "string", "description": "Email address" },
                        "phone": { "type": "string", "description": "Phone number" }
                    },
                    "required": ["name"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_contact",
                "description": "Update an existing contact's information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "contact_id": { "type": "string", "description": "The ID of the contact to update" },
                        "updates": { 
                            "type": "object", 
                            "description": "Dictionary of fields to update (e.g. {'email': 'new@example.com'})" 
                        }
                    },
                    "required": ["contact_id", "updates"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_contact",
                "description": "Delete a contact by ID",
                "parameters": {
                    "type": "object",
                    "properties": { "contact_id": { "type": "string", "description": "The ID of the contact to delete" } },
                    "required": ["contact_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_contacts",
                "description": "Get list of contacts",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_deals",
                "description": "Get list of deals",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_deal",
                "description": "Update an existing deal's information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "deal_id": { "type": "string", "description": "The ID of the deal to update" },
                        "updates": { 
                            "type": "object", 
                            "description": "Dictionary of fields to update (e.g. {'status': 'Closed Won', 'amount': 15000})" 
                        }
                    },
                    "required": ["deal_id", "updates"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_deal",
                "description": "Delete a deal by ID",
                "parameters": {
                    "type": "object",
                    "properties": { "deal_id": { "type": "string", "description": "The ID of the deal to delete" } },
                    "required": ["deal_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "add_task",
                "description": "Add a new task to the CRM",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": { "type": "string", "description": "Title of the task" },
                        "due_date": { "type": "string", "description": "Due date and time of the task (YYYY-MM-DD HH:MM). If no time is specified, default to 09:00." },
                        "contact_id": { "type": "string", "description": "Optional ID of the contact associated with the task" },
                        "description": { "type": "string", "description": "Detailed description of the task" }
                    },
                    "required": ["title"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_tasks",
                "description": "Get list of pending tasks (not completed)",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_task",
                "description": "Delete a task by ID",
                "parameters": {
                    "type": "object",
                    "properties": { "task_id": { "type": "string", "description": "The ID of the task to delete" } },
                    "required": ["task_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_task",
                "description": "Update a task (mark as done, change title, etc.)",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "task_id": { "type": "string", "description": "The ID of the task" },
                        "updates": { 
                            "type": "object", 
                            "description": "Dictionary of fields to update (e.g. {'completed': True, 'title': 'New Title'})" 
                        }
                    },
                    "required": ["task_id", "updates"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_debts",
                "description": "Get list of debts",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_debt",
                "description": "Update an existing debt's information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "debt_id": { "type": "string", "description": "The ID of the debt to update" },
                        "updates": { 
                            "type": "object", 
                            "description": "Dictionary of fields to update (e.g. {'amount_lent': 500, 'paid': True})" 
                        }
                    },
                    "required": ["debt_id", "updates"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_debt",
                "description": "Delete a debt",
                "parameters": {
                    "type": "object",
                    "properties": { "debt_id": { "type": "string" } },
                    "required": ["debt_id"]
                }
            }
        }
        # Add more tools here as needed to match AIChat.jsx
    ]

    messages = [
        {"role": "system", "content": system_prompt},
        *context_messages,
        {"role": "user", "content": user_message}
    ]

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
        tool_choice="auto"
    )

    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls

    if tool_calls:
        # Extend conversation with assistant's reply
        messages.append(response_message)

        for tool_call in tool_calls:
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)
            tool_call_id = tool_call.id
            
            # SENSITIVE TOOLS CHECK
            sensitive_tools = [
                "add_contact", "update_contact", "delete_contact",
                "add_task", "update_task", "delete_task",
                "add_deal", "update_deal", "delete_deal",
                "add_debt", "update_debt", "delete_debt"
            ]

            if function_name in sensitive_tools:
                # Return structured response for confirmation
                return {
                    "text": f"I need your confirmation to {function_name.replace('_', ' ')}.",
                    "confirmation_needed": True,
                    "action": function_name,
                    "args": function_args,
                    "tool_call_id": tool_call_id
                }

            function_response = ""
            
            if function_name == "add_contact":
                try:
                    result = add_contact(function_args, user_id=user_id, workflow_id=workflow_id)
                    function_response = f"Contact added: {result}"
                except Exception as e:
                    function_response = f"Error adding contact: {str(e)}"
            
            elif function_name == "get_contacts":
                try:
                    contacts = get_contacts(user_id=user_id, workflow_id=workflow_id)
                    # Format contacts for the AI
                    contacts_str = "\n".join([f"- {c['name']} (ID: {c['id']})" for c in contacts[:10]]) # Limit to 10
                    function_response = f"Found contacts:\n{contacts_str}"
                except Exception as e:
                    function_response = f"Error fetching contacts: {str(e)}"

            elif function_name == "get_deals":
                try:
                    deals = get_deals(user_id=user_id, workflow_id=workflow_id)
                    deals_str = "\n".join([f"- {d['title']} (${d['amount']}) - {d['status']}" for d in deals[:10]])
                    function_response = f"Found deals:\n{deals_str}"
                except Exception as e:
                    function_response = f"Error fetching deals: {str(e)}"

            elif function_name == "get_tasks":
                try:
                    tasks = get_tasks(user_id=user_id, workflow_id=workflow_id)
                    tasks_str = "\n".join([f"- {t['title']} (ID: {t['id']}, Due: {t['due_date']})" for t in tasks[:10]])
                    function_response = f"Found tasks:\n{tasks_str}"
                except Exception as e:
                    function_response = f"Error fetching tasks: {str(e)}"
            
            elif function_name == "add_task":
                try:
                    result = add_task(function_args, user_id=user_id, workflow_id=workflow_id)
                    function_response = f"Task added: {result}"
                except Exception as e:
                    function_response = f"Error adding task: {str(e)}"

            elif function_name == "get_debts":
                try:
                    debts = get_debts(user_id=user_id, workflow_id=workflow_id)
                    debts_str = "\n".join([f"- {d['borrower_name']}: ${d['amount_lent']} (ID: {d['id']})" for d in debts[:10]])
                    function_response = f"Found debts:\n{debts_str}"
                except Exception as e:
                    function_response = f"Error fetching debts: {str(e)}"
            
            elif function_name == "get_events":
                try:
                    events = get_events(user_id=user_id, workflow_id=workflow_id)
                    events_str = "\n".join([f"- {e['title']} ({e['start_time']})" for e in events[:10]])
                    function_response = f"Found events:\n{events_str}"
                except Exception as e:
                    function_response = f"Error fetching events: {str(e)}"

            else:
                function_response = "Function not implemented yet."

            messages.append({
                "tool_call_id": tool_call_id,
                "role": "tool",
                "name": function_name,
                "content": function_response,
            })

        # Get final response from AI
        second_response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        final_text = second_response.choices[0].message.content
        messages.append(second_response.choices[0].message)
        return {"text": final_text, "history": messages}

    return {"text": response_message.content, "history": messages}
