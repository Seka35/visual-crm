-- Add timezone to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Update process_reminders to use user's timezone
CREATE OR REPLACE FUNCTION public.process_reminders()
RETURNS void AS $$
DECLARE
    r RECORD;
    target_url TEXT;
    user_timezone TEXT;
    current_time_in_zone TIMESTAMP;
BEGIN
    -- 1. Process Calendar Events
    FOR r IN
        SELECT e.id, e.title, e.date, e.time, e.workflow_id, e.user_id,
               w.ntfy_url as workflow_url, u.ntfy_url as user_url, u.timezone
        FROM public.calendar_events e
        LEFT JOIN public.workflows w ON e.workflow_id = w.id
        LEFT JOIN public.users u ON e.user_id = u.id
        WHERE e.reminder_sent = FALSE
    LOOP
        -- Determine Timezone (default to UTC if null)
        user_timezone := COALESCE(r.timezone, 'UTC');
        
        -- Calculate current time in user's timezone
        -- We cast now() (which is timestamptz) to the user's timezone to get a timestamp without time zone
        -- that matches the "wall clock" time of the user.
        current_time_in_zone := (now() AT TIME ZONE user_timezone);

        -- Check if event time has passed
        -- e.date is likely stored as UTC midnight or similar.
        -- If e.date is TIMESTAMP, it's just a date. If TIMESTAMPTZ, it's a point in time.
        -- Assuming e.date is the date part and e.time is the time part.
        
        -- Logic: Construct the event timestamp from date + time
        -- Then compare with current time in that timezone.
        
        IF (r.date::date + r.time::time) <= current_time_in_zone THEN
            target_url := COALESCE(r.workflow_url, r.user_url);

            IF target_url IS NOT NULL AND target_url != '' THEN
                IF target_url NOT LIKE 'http%' THEN
                    target_url := 'https://' || target_url;
                END IF;

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

        -- Tasks are due at 9:00 AM by default
        IF (r.due_date::date + time '09:00:00') <= current_time_in_zone THEN
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
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
