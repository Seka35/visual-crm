-- Create a debug_logs table
CREATE TABLE IF NOT EXISTS public.debug_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    function_name TEXT,
    message TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update process_reminders to log steps
CREATE OR REPLACE FUNCTION public.process_reminders()
RETURNS void AS $$
DECLARE
    r RECORD;
    target_url TEXT;
    user_timezone TEXT;
    current_time_in_zone TIMESTAMP;
    response_id UUID;
BEGIN
    -- Log start
    INSERT INTO public.debug_logs (function_name, message) VALUES ('process_reminders', 'Function started');

    -- 1. Process Calendar Events
    FOR r IN
        SELECT e.id, e.title, e.date, e.time, e.workflow_id, e.user_id,
               w.ntfy_url as workflow_url, u.ntfy_url as user_url, u.timezone
        FROM public.calendar_events e
        LEFT JOIN public.workflows w ON e.workflow_id = w.id
        LEFT JOIN public.users u ON e.user_id = u.id
        WHERE e.reminder_sent = FALSE
    LOOP
        -- Log found event
        INSERT INTO public.debug_logs (function_name, message, details) 
        VALUES ('process_reminders', 'Found event', jsonb_build_object('event_id', r.id, 'title', r.title));

        -- Determine Timezone (default to UTC if null)
        user_timezone := COALESCE(r.timezone, 'UTC');
        
        -- Calculate current time in user's timezone
        current_time_in_zone := (now() AT TIME ZONE user_timezone);

        -- Log time check
        INSERT INTO public.debug_logs (function_name, message, details) 
        VALUES ('process_reminders', 'Time check', jsonb_build_object(
            'event_time', (r.date::date + r.time::time), 
            'current_time_in_zone', current_time_in_zone,
            'timezone', user_timezone
        ));
        
        IF (r.date::date + r.time::time) <= current_time_in_zone THEN
            target_url := COALESCE(r.workflow_url, r.user_url);

            -- Log target URL
            INSERT INTO public.debug_logs (function_name, message, details) 
            VALUES ('process_reminders', 'Target URL determined', jsonb_build_object('url', target_url));

            IF target_url IS NOT NULL AND target_url != '' THEN
                IF target_url NOT LIKE 'http%' THEN
                    target_url := 'https://' || target_url;
                END IF;

                -- Log sending request
                INSERT INTO public.debug_logs (function_name, message, details) 
                VALUES ('process_reminders', 'Sending HTTP request', jsonb_build_object('url', target_url));

                PERFORM net.http_post(
                    url := target_url,
                    body := jsonb_build_object(
                        'title', '📅 Event Reminder: ' || r.title,
                        'message', 'Event at ' || r.time,
                        'priority', 3,
                        'tags', ARRAY['calendar']
                    )
                );

                UPDATE public.calendar_events SET reminder_sent = TRUE WHERE id = r.id;
            ELSE
                INSERT INTO public.debug_logs (function_name, message) 
                VALUES ('process_reminders', 'No URL found for event');
            END IF;
        END IF;
    END LOOP;

    -- 2. Process Tasks
    FOR r IN
        SELECT t.id, t.title, t.due_date, t.workflow_id, t.user_id,
               w.ntfy_url as workflow_url, u.ntfy_url as user_url, u.timezone
        FROM public.tasks t
        LEFT JOIN public.workflows w ON t.workflow_id = w.id
        LEFT JOIN public.users u ON t.user_id = u.id
        WHERE t.reminder_sent = FALSE
        AND t.due_date IS NOT NULL
    LOOP
        user_timezone := COALESCE(r.timezone, 'UTC');
        current_time_in_zone := (now() AT TIME ZONE user_timezone);

        IF (r.due_date::date + time '09:00:00') <= current_time_in_zone THEN
            target_url := COALESCE(r.workflow_url, r.user_url);

            IF target_url IS NOT NULL AND target_url != '' THEN
                IF target_url NOT LIKE 'http%' THEN
                    target_url := 'https://' || target_url;
                END IF;

                INSERT INTO public.debug_logs (function_name, message, details) 
                VALUES ('process_reminders', 'Sending Task HTTP request', jsonb_build_object('url', target_url));

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
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
