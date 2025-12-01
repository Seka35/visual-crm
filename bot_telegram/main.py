import os
import os
from dotenv import load_dotenv
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler
from handlers import start, help_command, login_command, set_workflow_command, logout_command, settings_command, handle_text_message, handle_voice_message, button_callback

import os
import os
from dotenv import load_dotenv
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler
from telegram import Update
from handlers import start, help_command, login_command, set_workflow_command, logout_command, settings_command, menu_command, handle_text_message, handle_voice_message, button_callback

async def post_init(application: Application) -> None:
    """Set up the bot's commands."""
    await application.bot.set_my_commands([
        ("start", "Start the bot"),
        ("login", "Link your account"),
        ("menu", "Show dashboard"),
        ("settings", "Manage account & timezone"),
        ("set_workflow", "Switch workflow"),
        ("help", "Get help")
    ])

def main() -> None:
    """Start the bot."""
    # Load environment variables
    # Load .env from root directory first (so shared keys like OpenAI/Supabase are available)
    # and local .env second (to allow specific overrides or bot-specific keys)
    root_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    load_dotenv(root_env_path)
    load_dotenv()

    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    
    if not token:
        print("Error: TELEGRAM_BOT_TOKEN not found.")
        return

    print("Starting bot...")
    
    # Create the Application
    application = Application.builder().token(token).post_init(post_init).build()

    # Register handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("login", login_command))
    application.add_handler(CommandHandler("logout", logout_command))
    application.add_handler(CommandHandler("settings", settings_command))
    application.add_handler(CommandHandler("menu", menu_command)) 
    application.add_handler(CommandHandler("set_workflow", set_workflow_command))
    
    # Voice handler
    application.add_handler(MessageHandler(filters.VOICE, handle_voice_message))
    
    # Text handler
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text_message))
    
    # Callback query handler
    application.add_handler(CallbackQueryHandler(button_callback))

    print("Trevor Philips Bot is running... Don't fuck it up.")
    
    # Run the bot
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
