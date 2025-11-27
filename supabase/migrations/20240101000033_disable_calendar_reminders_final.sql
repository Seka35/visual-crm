-- Final fix for notifications: Backfill workflow_id and disable redundant calendar reminders

-- 1. Backfill workflow_id for Tasks that are linked to Calendar Events but missing workflow_id
UPDATE public.tasks t
SET workflow_id = c.workflow_id
FROM public.calendar_events c
WHERE t.calendar_event_id = c.id
AND t.workflow_id IS NULL
AND c.workflow_id IS NOT NULL;

-- 2. Backfill workflow_id for Calendar Events that are linked to Tasks but missing workflow_id
UPDATE public.calendar_events c
SET workflow_id = t.workflow_id
FROM public.tasks t
WHERE c.task_id = t.id
AND c.workflow_id IS NULL
AND t.workflow_id IS NOT NULL;

-- 3. Update process_reminders to disable double notifications (SAFE now that workflow_id is synced)
CREATE OR REPLACE FUNCTION public.process_reminders()
RETURNS void AS $$
DECLARE
    r RECORD;
    target_url TEXT;
    user_timezone TEXT;
    current_time_in_zone TIMESTAMP;
    query_params JSONB;
BEGIN
    -- Log start
    INSERT INTO public.debug_logs (function_name, message) VALUES ('process_reminders', 'Function started (Final Version: No Double Notifications)');

    -- 1. Process Calendar Events (SKIP if linked to a task)
    FOR r IN
        SELECT e.id, e.title, e.description, e.date, e.time, e.workflow_id, e.user_id,
               w.ntfy_url as workflow_url, u.ntfy_url as user_url, u.timezone
        FROM public.calendar_events e
        LEFT JOIN public.workflows w ON e.workflow_id = w.id
        LEFT JOIN public.users u ON e.user_id = u.id
        WHERE e.reminder_sent = FALSE
        AND e.task_id IS NULL -- Only process if NOT linked to a task
    LOOP
        BEGIN
            user_timezone := COALESCE(r.timezone, 'UTC');
            current_time_in_zone := (now() AT TIME ZONE user_timezone);

            IF (r.date::date + r.time::time) <= current_time_in_zone THEN
                target_url := COALESCE(r.workflow_url, r.user_url);

                IF target_url IS NOT NULL AND target_url != '' THEN
                    IF target_url NOT LIKE 'http%' THEN
                        target_url := 'https://' || target_url;
                    END IF;

                    -- Construct Query Params
                    query_params := jsonb_build_object(
                        'title', '📅 ' || r.title,
                        'priority', '3',
                        'tags', 'calendar',
                        'message', 'Event at ' || r.time || E'\n' || COALESCE(r.description, '')
                    );

                    INSERT INTO public.debug_logs (function_name, message, details) 
                    VALUES ('process_reminders', 'Sending HTTP POST', jsonb_build_object('url', target_url, 'params', query_params));

                    -- Send POST request with Params and NULL Body
                    PERFORM net.http_post(
                        url := target_url,
                        params := query_params,
                        body := NULL
                    );

                    UPDATE public.calendar_events SET reminder_sent = TRUE WHERE id = r.id;
                END IF;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO public.debug_logs (function_name, message, details) 
            VALUES ('process_reminders', 'Error processing event', jsonb_build_object('event_id', r.id, 'error', SQLERRM));
        END;
    END LOOP;

    -- 2. Process Tasks
    FOR r IN
        SELECT t.id, t.title, t.description, t.due_date, t.reminder_time, t.workflow_id, t.user_id,
               w.ntfy_url as workflow_url, u.ntfy_url as user_url, u.timezone
        FROM public.tasks t
        LEFT JOIN public.workflows w ON t.workflow_id = w.id
        LEFT JOIN public.users u ON t.user_id = u.id
        WHERE t.reminder_sent = FALSE
        AND t.due_date IS NOT NULL
    LOOP
        BEGIN
            user_timezone := COALESCE(r.timezone, 'UTC');
            current_time_in_zone := (now() AT TIME ZONE user_timezone);

            -- Use reminder_time if set, otherwise default to 09:00:00
            IF (r.due_date::date + COALESCE(r.reminder_time, '09:00:00'::time)) <= current_time_in_zone THEN
                target_url := COALESCE(r.workflow_url, r.user_url);

                IF target_url IS NOT NULL AND target_url != '' THEN
                    IF target_url NOT LIKE 'http%' THEN
                        target_url := 'https://' || target_url;
                    END IF;

                    query_params := jsonb_build_object(
                        'title', '✅ ' || r.title,
                        'priority', '3',
                        'tags', 'clipboard',
                        'message', 'Due Today at ' || COALESCE(to_char(r.reminder_time, 'HH24:MI'), '09:00') || E'\n' || COALESCE(r.description, '')
                    );

                    INSERT INTO public.debug_logs (function_name, message, details) 
                    VALUES ('process_reminders', 'Sending Task HTTP POST', jsonb_build_object('url', target_url, 'params', query_params));

                    PERFORM net.http_post(
                        url := target_url,
                        params := query_params,
                        body := NULL
                    );

                    UPDATE public.tasks SET reminder_sent = TRUE WHERE id = r.id;
                END IF;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO public.debug_logs (function_name, message, details) 
            VALUES ('process_reminders', 'Error processing task', jsonb_build_object('task_id', r.id, 'error', SQLERRM));
        END;
    END LOOP;

    -- 3. Process Deals
    FOR r IN
        SELECT d.id, d.title, d.amount, d.reminder_date, d.reminder_time, d.workflow_id, d.user_id,
               w.ntfy_url as workflow_url, u.ntfy_url as user_url, u.timezone
        FROM public.deals d
        LEFT JOIN public.workflows w ON d.workflow_id = w.id
        LEFT JOIN public.users u ON d.user_id = u.id
        WHERE d.reminder_sent = FALSE
        AND d.reminder_date IS NOT NULL
    LOOP
        BEGIN
            user_timezone := COALESCE(r.timezone, 'UTC');
            current_time_in_zone := (now() AT TIME ZONE user_timezone);

            -- Use reminder_time if set, otherwise default to 09:00:00
            IF (r.reminder_date::date + COALESCE(r.reminder_time, '09:00:00'::time)) <= current_time_in_zone THEN
                target_url := COALESCE(r.workflow_url, r.user_url);

                IF target_url IS NOT NULL AND target_url != '' THEN
                    IF target_url NOT LIKE 'http%' THEN
                        target_url := 'https://' || target_url;
                    END IF;

                    query_params := jsonb_build_object(
                        'title', '💰 Deal Reminder: ' || r.title,
                        'priority', '3',
                        'tags', 'moneybag',
                        'message', 'Reminder for deal worth ' || r.amount || ' at ' || COALESCE(to_char(r.reminder_time, 'HH24:MI'), '09:00')
                    );

                    INSERT INTO public.debug_logs (function_name, message, details) 
                    VALUES ('process_reminders', 'Sending Deal HTTP POST', jsonb_build_object('url', target_url, 'params', query_params));

                    PERFORM net.http_post(
                        url := target_url,
                        params := query_params,
                        body := NULL
                    );

                    UPDATE public.deals SET reminder_sent = TRUE WHERE id = r.id;
                END IF;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO public.debug_logs (function_name, message, details) 
            VALUES ('process_reminders', 'Error processing deal', jsonb_build_object('deal_id', r.id, 'error', SQLERRM));
        END;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
