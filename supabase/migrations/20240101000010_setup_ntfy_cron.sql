-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add ntfy_url to workflows
ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS ntfy_url TEXT;

-- Add ntfy_url to users (for personal workspace)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ntfy_url TEXT;

-- Add reminder_sent to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Add reminder_sent to calendar_events
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Function to process reminders
CREATE OR REPLACE FUNCTION public.process_reminders()
RETURNS void AS $$
DECLARE
    r RECORD;
    target_url TEXT;
BEGIN
    -- 1. Process Calendar Events
    FOR r IN
        SELECT e.id, e.title, e.date, e.time, e.workflow_id, e.user_id,
               w.ntfy_url as workflow_url, u.ntfy_url as user_url
        FROM public.calendar_events e
        LEFT JOIN public.workflows w ON e.workflow_id = w.id
        LEFT JOIN public.users u ON e.user_id = u.id
        WHERE e.reminder_sent = FALSE
        AND (e.date::date + e.time::time) <= (now() AT TIME ZONE 'UTC')
    LOOP
        -- Determine URL
        target_url := COALESCE(r.workflow_url, r.user_url);

        IF target_url IS NOT NULL AND target_url != '' THEN
            -- Ensure URL has protocol
            IF target_url NOT LIKE 'http%' THEN
                target_url := 'https://' || target_url;
            END IF;

            -- Send Notification
            PERFORM net.http_post(
                url := target_url,
                body := jsonb_build_object(
                    'title', '📅 Event Reminder: ' || r.title,
                    'message', 'Event at ' || r.time,
                    'priority', 3,
                    'tags', ARRAY['calendar']
                )
            );

            -- Mark as sent
            UPDATE public.calendar_events SET reminder_sent = TRUE WHERE id = r.id;
        END IF;
    END LOOP;

    -- 2. Process Tasks
    FOR r IN
        SELECT t.id, t.title, t.due_date, t.workflow_id, t.user_id,
               w.ntfy_url as workflow_url, u.ntfy_url as user_url
        FROM public.tasks t
        LEFT JOIN public.workflows w ON t.workflow_id = w.id
        LEFT JOIN public.users u ON t.user_id = u.id
        WHERE t.reminder_sent = FALSE
        AND t.due_date IS NOT NULL
        AND (t.due_date::date + time '09:00:00') <= (now() AT TIME ZONE 'UTC')
    LOOP
        target_url := COALESCE(r.workflow_url, r.user_url);

        IF target_url IS NOT NULL AND target_url != '' THEN
            IF target_url NOT LIKE 'http%' THEN
                target_url := 'https://' || target_url;
            END IF;

            PERFORM net.http_post(
                url := target_url,
                body := jsonb_build_object(
                    'title', '✅ Task Due: ' || r.title,
                    'message', 'This task is due today.',
                    'priority', 3,
                    'tags', ARRAY['clipboard']
                )
            );

            UPDATE public.tasks SET reminder_sent = TRUE WHERE id = r.id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule Cron (Every minute)
-- Note: We use a unique name 'process-reminders' to avoid duplicates if re-run
SELECT cron.schedule('process-reminders', '* * * * *', 'SELECT public.process_reminders()');
