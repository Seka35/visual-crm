-- Troubleshooting Script

-- 1. Check the last 10 debug logs to see what happened
SELECT * FROM public.debug_logs ORDER BY created_at DESC LIMIT 10;

-- 2. Force run the function manually to see if it works NOW
SELECT public.process_reminders();

-- 3. Restart the Cron Job (Unschedule and Reschedule)
SELECT cron.unschedule('process-reminders');
SELECT cron.schedule('process-reminders', '* * * * *', 'SELECT public.process_reminders()');

-- 4. Check Cron Job Status
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
