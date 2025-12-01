import os
import logging
import re
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ReplyKeyboardMarkup, KeyboardButton
from telegram.constants import ParseMode
from telegram.ext import ContextTypes, CommandHandler
from ai_logic import get_ai_response
from voice import transcribe_audio
from db import (
    add_contact, update_contact, delete_contact,
    add_task, update_task, delete_task,
    update_deal, delete_deal,
    update_debt, delete_debt,
    get_user_by_telegram_id, link_telegram_user, get_workflows, update_user_timezone
)

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

def format_text(text):
    """Convert Markdown bold to HTML bold and clean up."""
    if not text:
        return ""
    # Convert **text** to <b>text</b>
    text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    return text

def get_dashboard_keyboard():
    """Return the main dashboard inline keyboard."""
    keyboard = [
        [
            InlineKeyboardButton("📝 My Tasks", callback_data="get_tasks"),
            InlineKeyboardButton("💰 My Deals", callback_data="get_deals"),
        ],
        [
            InlineKeyboardButton("👥 Contacts", callback_data="get_contacts"),
            InlineKeyboardButton("➕ Add Contact", callback_data="add_contact_prompt"),
        ],
        [
            InlineKeyboardButton("⚙️ Settings", callback_data="settings_menu")
        ]
    ]
    return InlineKeyboardMarkup(keyboard)

def get_main_menu_keyboard():
    """Return the persistent main menu keyboard."""
    keyboard = [
        [KeyboardButton("⚙️ Menu")]
    ]
    return ReplyKeyboardMarkup(keyboard, resize_keyboard=True, is_persistent=True)

async def ensure_logged_in(update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
    """Ensure user is logged in, recovering from DB if needed."""
    if context.user_data.get("user_id"):
        return True
        
    telegram_id = update.effective_user.id
    logger.info(f"Checking DB for user {telegram_id}")
    user = get_user_by_telegram_id(telegram_id)
    
    if user:
        logger.info(f"Restoring session for {user['email']}")
        context.user_data["user_id"] = user["id"]
        context.user_data["user_email"] = user["email"]
        context.user_data["timezone"] = user.get("timezone", "UTC")
        return True
    
    logger.warning(f"User {telegram_id} not found in DB")
    return False

async def menu_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show the main dashboard menu."""
    if not await ensure_logged_in(update, context):
        await update.message.reply_text("Log in first, idiot. /login <email>", reply_markup=get_main_menu_keyboard())
        return
        
    user = update.effective_user
    await update.message.reply_html(
        f"Yo {user.mention_html()}! What's the plan?",
        reply_markup=get_dashboard_keyboard()
    )

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    
    # Try to recover session
    if await ensure_logged_in(update, context):
        email = context.user_data["user_email"]
        await update.message.reply_html(
            rf"Yo {user.mention_html()}! Welcome back, <b>{email}</b>.",
            reply_markup=get_dashboard_keyboard()
        )
    else:
        await update.message.reply_html(
            rf"Yo {user.mention_html()}! Trevor Philips here.\n\n"
            "I don't know who the fuck you are. You need to log in first.\n"
            "Type <code>/login your_email@example.com</code> to link your account.",
            reply_markup=get_main_menu_keyboard()
        )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /help is issued."""
    await update.message.reply_text(
        "Commands:\n"
        "/start - Start the bot\n"
        "/login <email> - Link your account\n"
        "/logout - Disconnect\n"
        "/menu - Show dashboard\n"
        "/settings - Manage account & timezone\n"
        "/set_workflow - Choose your business\n"
        "/help - Show this message",
        reply_markup=get_main_menu_keyboard()
    )

async def login_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle user login via email."""
    if not context.args:
        await update.message.reply_text("You need to give me an email, genius. Usage: /login <email>")
        return

    email = context.args[0]
    telegram_id = update.effective_user.id
    
    success, result = link_telegram_user(email, telegram_id)
    
    if success:
        user = result
        context.user_data["user_id"] = user["id"]
        context.user_data["user_email"] = user["email"]
        context.user_data["timezone"] = user.get("timezone", "UTC")
        
        await update.message.reply_html(f"✅ You're in, <b>{user['email']}</b>. Now get to work!", reply_markup=get_main_menu_keyboard())
        
        # Show dashboard
        await menu_command(update, context)
    else:
        await update.message.reply_text(f"❌ Login failed: {result}")

async def logout_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Logout the user."""
    context.user_data.clear()
    await update.message.reply_text("🚪 You're out. Don't let the door hit you.", reply_markup=get_main_menu_keyboard())

async def settings_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /settings command."""
    if not await ensure_logged_in(update, context):
        if update.callback_query:
            await update.callback_query.answer("Log in first!", show_alert=True)
        else:
            await update.message.reply_text("Log in first, idiot. /login <email>", reply_markup=get_main_menu_keyboard())
        return
        
    email = context.user_data.get("user_email", "Unknown")
    workflow = context.user_data.get("workflow_name", "None")
    timezone = context.user_data.get("timezone", "UTC")
    
    keyboard = [
        [InlineKeyboardButton("🔄 Switch Workflow", callback_data="set_workflow")],
        [InlineKeyboardButton("🕒 Change Timezone", callback_data="set_timezone")],
        [InlineKeyboardButton("🔙 Back", callback_data="main_menu")],
        [InlineKeyboardButton("🚪 Logout", callback_data="logout_action")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = (
        f"<b>⚙️ SETTINGS</b>\n\n"
        f"👤 User: <b>{email}</b>\n"
        f"🏢 Workflow: <b>{workflow}</b>\n"
        f"🌍 Timezone: <b>{timezone}</b>"
    )

    if update.message:
        await update.message.reply_html(text, reply_markup=reply_markup)
    else:
        await update.callback_query.edit_message_text(text, reply_markup=reply_markup, parse_mode=ParseMode.HTML)

async def set_workflow_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /set_workflow command."""
    if not await ensure_logged_in(update, context):
        if update.callback_query:
            await update.callback_query.answer("Log in first!", show_alert=True)
        else:
            await update.message.reply_text("Log in first, idiot. /login <email>", reply_markup=get_main_menu_keyboard())
        return

    user_id = context.user_data["user_id"]
    workflows = get_workflows(user_id)
    
    if not workflows:
        msg = "You don't have any workflows. Go create one in the app first."
        if update.callback_query:
            await update.callback_query.edit_message_text(msg)
        else:
            await update.message.reply_text(msg, reply_markup=get_main_menu_keyboard())
        return
        
    keyboard = []
    
    # Add "MY TURF" (Personal) option
    keyboard.append([InlineKeyboardButton("🏠 MY TURF (Private)", callback_data="select_workflow_None_MY TURF")])
    
    for w in workflows:
        keyboard.append([InlineKeyboardButton(w["name"], callback_data=f"select_workflow_{w['id']}_{w['name']}")])
    
    # Add Back button
    keyboard.append([InlineKeyboardButton("🔙 Back", callback_data="back_to_settings")])
        
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if update.callback_query:
        await update.callback_query.edit_message_text("Pick a workflow or I'll pick one for you (and you won't like it):", reply_markup=reply_markup)
    else:
        await update.message.reply_text("Pick a workflow or I'll pick one for you (and you won't like it):", reply_markup=reply_markup)

async def handle_text_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle text messages."""
    user_message = update.message.text
    
    # Handle Menu Button
    if user_message == "⚙️ Menu":
        await menu_command(update, context)
        return

    telegram_id = update.effective_user.id
    
    # Check auth
    if "user_id" not in context.user_data:
        crm_user = get_user_by_telegram_id(telegram_id)
        if crm_user:
            context.user_data["user_id"] = crm_user["id"]
            context.user_data["user_email"] = crm_user["email"]
            context.user_data["timezone"] = crm_user.get("timezone", "UTC")
        else:
            await update.message.reply_text("Who are you? /login first.", reply_markup=get_main_menu_keyboard())
            return

    user_id = context.user_data["user_id"]
    workflow_id = context.user_data.get("workflow_id")
    workflow_name = context.user_data.get("workflow_name")
    timezone = context.user_data.get("timezone", "UTC")
    
    # Send "typing" action
    await update.message.chat.send_action(action="typing")
    
    # Initialize history if not exists
    if "history" not in context.user_data:
        context.user_data["history"] = []
    
    # Get history (limit to last 10 messages to save tokens)
    history = context.user_data["history"][-10:]
    
    try:
        # Get AI response with history and context
        ai_response = get_ai_response(
            user_message, 
            context_messages=history, 
            user_id=user_id, 
            workflow_id=workflow_id,
            workflow_name=workflow_name,
            timezone=timezone
        )
        
        # Update history with the full chain returned by AI
        if isinstance(ai_response, dict) and "history" in ai_response:
            full_history = ai_response["history"]
            serializable_history = []
            for msg in full_history:
                if hasattr(msg, 'model_dump'):
                    msg_dict = msg.model_dump()
                elif hasattr(msg, 'to_dict'):
                    msg_dict = msg.to_dict()
                elif isinstance(msg, dict):
                    msg_dict = msg
                else:
                    msg_dict = {"role": msg.role, "content": msg.content}
                    if hasattr(msg, 'tool_calls') and msg.tool_calls:
                        msg_dict['tool_calls'] = [tc.model_dump() if hasattr(tc, 'model_dump') else tc for tc in msg.tool_calls]
                    if hasattr(msg, 'tool_call_id') and msg.tool_call_id:
                        msg_dict['tool_call_id'] = msg.tool_call_id
                
                if msg_dict.get("role") != "system":
                    serializable_history.append(msg_dict)
            
            context.user_data["history"] = serializable_history[-20:] # Keep last 20 messages
        
        if isinstance(ai_response, dict):
            text = ai_response.get("text", "")
            formatted_text = format_text(text)
            
            if ai_response.get("confirmation_needed"):
                # Store pending action
                context.user_data["pending_action"] = {
                    "action": ai_response["action"],
                    "args": ai_response["args"]
                }
                
                # Create confirmation buttons
                keyboard = [
                    [
                        InlineKeyboardButton("✅ Confirm", callback_data="confirm_action"),
                        InlineKeyboardButton("❌ Cancel", callback_data="cancel_action")
                    ],
                    [InlineKeyboardButton("✏️ Modify", callback_data="modify_action")]
                ]
                reply_markup = InlineKeyboardMarkup(keyboard)
                
                await update.message.reply_text(
                    f"{formatted_text}\n\nAction: {ai_response['action']}\nArgs: {ai_response['args']}", 
                    reply_markup=reply_markup,
                    parse_mode=ParseMode.HTML
                )
            else:
                await update.message.reply_text(formatted_text, parse_mode=ParseMode.HTML, reply_markup=get_main_menu_keyboard())
        else:
            # Fallback for string response
            text = str(ai_response)
            formatted_text = format_text(text)
            context.user_data["history"].append({"role": "assistant", "content": text})
            await update.message.reply_text(formatted_text, parse_mode=ParseMode.HTML, reply_markup=get_main_menu_keyboard())
            
    except Exception as e:
        logger.error(f"Error handling text message: {e}")
        await update.message.reply_text("Something went wrong. Fix your shit.", reply_markup=get_main_menu_keyboard())

async def handle_voice_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle voice messages."""
    voice = update.message.voice
    telegram_id = update.effective_user.id

    # Check auth
    if "user_id" not in context.user_data:
        crm_user = get_user_by_telegram_id(telegram_id)
        if crm_user:
            context.user_data["user_id"] = crm_user["id"]
            context.user_data["user_email"] = crm_user["email"]
            context.user_data["timezone"] = crm_user.get("timezone", "UTC")
        else:
            await update.message.reply_text("Who are you? /login first.", reply_markup=get_main_menu_keyboard())
            return

    user_id = context.user_data["user_id"]
    workflow_id = context.user_data.get("workflow_id")
    workflow_name = context.user_data.get("workflow_name")
    timezone = context.user_data.get("timezone", "UTC")
    
    # Send "typing" action
    await update.message.chat.send_action(action="typing")
    
    try:
        # Download voice file
        file = await context.bot.get_file(voice.file_id)
        file_path = f"voice_{voice.file_id}.ogg"
        await file.download_to_drive(file_path)
        
        # Transcribe
        transcribed_text = transcribe_audio(file_path)
        
        # Clean up file
        if os.path.exists(file_path):
            os.remove(file_path)
            
        if transcribed_text:
            await update.message.reply_text(f"🎤 You said: \"{transcribed_text}\"", reply_markup=get_main_menu_keyboard())
            
            # Process with AI
            ai_response = get_ai_response(
                transcribed_text, 
                user_id=user_id, 
                workflow_id=workflow_id,
                workflow_name=workflow_name,
                timezone=timezone
            )
            
            if isinstance(ai_response, dict):
                text = ai_response.get("text", "")
                formatted_text = format_text(text)
                
                if ai_response.get("confirmation_needed"):
                    context.user_data["pending_action"] = {
                        "action": ai_response["action"],
                        "args": ai_response["args"]
                    }
                    keyboard = [
                        [
                            InlineKeyboardButton("✅ Confirm", callback_data="confirm_action"),
                            InlineKeyboardButton("❌ Cancel", callback_data="cancel_action")
                        ],
                        [InlineKeyboardButton("✏️ Modify", callback_data="modify_action")]
                    ]
                    reply_markup = InlineKeyboardMarkup(keyboard)
                    await update.message.reply_text(
                        f"{formatted_text}\n\nAction: {ai_response['action']}\nArgs: {ai_response['args']}", 
                        reply_markup=reply_markup,
                        parse_mode=ParseMode.HTML
                    )
                else:
                    await update.message.reply_text(formatted_text, parse_mode=ParseMode.HTML, reply_markup=get_main_menu_keyboard())
            else:
                text = str(ai_response)
                formatted_text = format_text(text)
                await update.message.reply_text(formatted_text, parse_mode=ParseMode.HTML, reply_markup=get_main_menu_keyboard())
        else:
            await update.message.reply_text("I couldn't hear you. Speak up!", reply_markup=get_main_menu_keyboard())
        
    except Exception as e:
        logger.error(f"Error handling voice message: {e}")
        await update.message.reply_text("I couldn't hear you. Speak up!", reply_markup=get_main_menu_keyboard())

async def handle_shortcut(prompt: str, query, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Helper to handle shortcut buttons as if they were text messages."""
    user_id = context.user_data.get("user_id")
    workflow_id = context.user_data.get("workflow_id")
    workflow_name = context.user_data.get("workflow_name")
    timezone = context.user_data.get("timezone", "UTC")
    
    # Initialize history
    if "history" not in context.user_data:
        context.user_data["history"] = []
    
    try:
        ai_response = get_ai_response(
            prompt, 
            context.user_data["history"], 
            user_id=user_id, 
            workflow_id=workflow_id,
            workflow_name=workflow_name,
            timezone=timezone
        )
        
        if isinstance(ai_response, dict):
            text = ai_response.get("text", "")
            formatted_text = format_text(text)
            await query.message.reply_text(formatted_text, parse_mode=ParseMode.HTML, reply_markup=get_main_menu_keyboard())
        else:
            await query.message.reply_text(str(ai_response), reply_markup=get_main_menu_keyboard())
            
    except Exception as e:
        await query.message.reply_text(f"Error: {e}", reply_markup=get_main_menu_keyboard())

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle button clicks."""
    query = update.callback_query
    await query.answer()
    
    logger.info(f"Button clicked: {query.data}")
    
    # Ensure logged in (recover session if needed)
    if not await ensure_logged_in(update, context):
        logger.warning("Button click rejected: Not logged in")
        await query.edit_message_text("Session expired. Please /login again.")
        return
    
    data = query.data
    
    # Handle workflow selection
    if data.startswith("select_workflow_"):
        parts = data.split("_")
        workflow_id = parts[2]
        workflow_name = "_".join(parts[3:])
        context.user_data["workflow_id"] = workflow_id
        context.user_data["workflow_name"] = workflow_name
        await query.edit_message_text(f"✅ Workflow set to: <b>{workflow_name}</b>", parse_mode=ParseMode.HTML)
        return
        
    if data == "set_workflow":
        # We want to edit the message if it comes from a button click, but set_workflow_command sends a new message.
        # Let's inline the logic here for the button click to allow "Back"
        user_id = context.user_data.get("user_id")
        workflows = get_workflows(user_id)
        
        keyboard = []
        # Add "MY TURF" (Personal) option
        keyboard.append([InlineKeyboardButton("🏠 MY TURF (Private)", callback_data="select_workflow_None_MY TURF")])
        
        for w in workflows:
            keyboard.append([InlineKeyboardButton(w["name"], callback_data=f"select_workflow_{w['id']}_{w['name']}")])
            
        # Add Back button
        keyboard.append([InlineKeyboardButton("🔙 Back", callback_data="back_to_settings")])
            
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text("Pick a workflow or I'll pick one for you (and you won't like it):", reply_markup=reply_markup)
        return

    # Handle Settings Menu
    if data == "settings_menu" or data == "back_to_settings":
        # Re-use settings command logic but edit message
        user_email = context.user_data.get("user_email", "Unknown")
        workflow_name = context.user_data.get("workflow_name", "None")
        timezone = context.user_data.get("timezone", "UTC")
        
        text = (
            f"⚙️ <b>SETTINGS</b>\n\n"
            f"👤 <b>User:</b> {user_email}\n"
            f"🏢 <b>Workflow:</b> {workflow_name}\n"
            f"🕒 <b>Timezone:</b> {timezone}\n\n"
            f"What do you want to change?"
        )
        
        keyboard = [
            [InlineKeyboardButton("🔄 Switch Workflow", callback_data="set_workflow")],
            [InlineKeyboardButton("🕒 Change Timezone", callback_data="set_timezone")],
            [InlineKeyboardButton("🔙 Back", callback_data="main_menu")],
            [InlineKeyboardButton("🚪 Logout", callback_data="logout_action")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text(text, reply_markup=reply_markup, parse_mode=ParseMode.HTML)
        return

    if data == "logout_action":
        await logout_command(update, context)
        return

    if data == "main_menu":
        await query.edit_message_text(
            "Yo! What's the plan?",
            reply_markup=get_dashboard_keyboard(),
            parse_mode=ParseMode.HTML
        )
        return

    if data == "set_timezone":
        # Show common timezones
        keyboard = [
            [InlineKeyboardButton("UTC", callback_data="tz_UTC")],
            [InlineKeyboardButton("Europe/Paris", callback_data="tz_Europe/Paris")],
            [InlineKeyboardButton("America/New_York", callback_data="tz_America/New_York")],
            [InlineKeyboardButton("Asia/Tokyo", callback_data="tz_Asia/Tokyo")],
            [InlineKeyboardButton("Australia/Sydney", callback_data="tz_Australia/Sydney")],
            [InlineKeyboardButton("🔙 Back", callback_data="back_to_settings")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await query.edit_message_text("Pick a timezone:", reply_markup=reply_markup)
        return

    if data.startswith("tz_"):
        timezone = data.replace("tz_", "")
        user_id = context.user_data.get("user_id")
        
        # Update in DB
        update_user_timezone(user_id, timezone)
        # Update in context
        context.user_data["timezone"] = timezone
        
        await query.edit_message_text(f"✅ Timezone set to: <b>{timezone}</b>", parse_mode=ParseMode.HTML)
        return

    # Handle confirmation flow
    if data == "confirm_action":
        pending = context.user_data.get("pending_action")
        if pending:
            action = pending["action"]
            args = pending["args"]
            user_id = context.user_data.get("user_id")
            workflow_id = context.user_data.get("workflow_id")
            
            try:
                result = "Done."
                if action == "add_contact":
                    add_contact(args, user_id=user_id, workflow_id=workflow_id)
                elif action == "delete_task":
                    delete_task(args["task_id"])
                elif action == "update_task":
                    update_task(args["task_id"], args["updates"])
                elif action == "delete_contact":
                    delete_contact(args["contact_id"])
                elif action == "update_contact":
                    update_contact(args["contact_id"], args["updates"])
                elif action == "add_task":
                    add_task(args, user_id=user_id, workflow_id=workflow_id)
                elif action == "delete_deal":
                    delete_deal(args["deal_id"])
                elif action == "update_deal":
                    update_deal(args["deal_id"], args["updates"])
                elif action == "delete_debt":
                    delete_debt(args["debt_id"])
                elif action == "update_debt":
                    update_debt(args["debt_id"], args["updates"])
                
                await query.edit_message_text(f"✅ Action {action} confirmed and executed.")
                context.user_data.pop("pending_action", None)
            except Exception as e:
                await query.edit_message_text(f"❌ Error executing {action}: {str(e)}")
        else:
            await query.edit_message_text("No pending action found.")
            
    elif data == "cancel_action":
        context.user_data.pop("pending_action", None)
        await query.edit_message_text("❌ Action cancelled.")

    elif data == "modify_action":
        context.user_data.pop("pending_action", None)
        await query.edit_message_text("Okay, tell me what you want to change.")

    # Handle shortcuts
    elif data == "get_tasks":
        prompt = "Show me my tasks"
        await handle_shortcut(prompt, query, context)
    elif data == "get_deals":
        prompt = "Show me my deals"
        await handle_shortcut(prompt, query, context)
    elif data == "get_contacts":
        prompt = "Show me my contacts"
        await handle_shortcut(prompt, query, context)
    elif data == "add_contact_prompt":
        await query.edit_message_text(text="Fine. Send me the contact details (Name, Company, etc.).")
