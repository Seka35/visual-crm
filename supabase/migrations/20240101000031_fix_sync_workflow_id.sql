-- Update sync functions to include workflow_id

-- Function to sync Tasks -> Calendar
CREATE OR REPLACE FUNCTION public.sync_tasks_to_calendar()
RETURNS TRIGGER AS $$
DECLARE
    new_event_id UUID;
BEGIN
    -- Prevent recursion
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    -- INSERT
    IF (TG_OP = 'INSERT') THEN
        IF NEW.due_date IS NOT NULL THEN
            BEGIN
                INSERT INTO public.calendar_events (title, description, date, time, type, user_id, task_id, workflow_id)
                VALUES (
                    NEW.title,
                    NEW.description,
                    NEW.due_date,
                    COALESCE(NEW.reminder_time, '09:00:00'),
                    'task',
                    NEW.user_id,
                    NEW.id,
                    NEW.workflow_id
                )
                RETURNING id INTO new_event_id;

                UPDATE public.tasks SET calendar_event_id = new_event_id WHERE id = NEW.id;
            EXCEPTION WHEN OTHERS THEN
                INSERT INTO public.debug_logs (function_name, message, details)
                VALUES ('sync_tasks_to_calendar', 'Insert failed', jsonb_build_object('error', SQLERRM));
            END;
        END IF;
        RETURN NEW;

    -- UPDATE
    ELSIF (TG_OP = 'UPDATE') THEN
        -- If completed, remove from calendar
        IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
            DELETE FROM public.calendar_events WHERE task_id = NEW.id;
            RETURN NEW;
        END IF;

        -- If uncompleted, add back to calendar
        IF NEW.completed = FALSE AND OLD.completed = TRUE AND NEW.due_date IS NOT NULL THEN
             INSERT INTO public.calendar_events (title, description, date, time, type, user_id, task_id, workflow_id)
            VALUES (
                NEW.title,
                NEW.description,
                NEW.due_date,
                COALESCE(NEW.reminder_time, '09:00:00'),
                'task',
                NEW.user_id,
                NEW.id,
                NEW.workflow_id
            )
            RETURNING id INTO new_event_id;
            UPDATE public.tasks SET calendar_event_id = new_event_id WHERE id = NEW.id;
            RETURN NEW;
        END IF;

        -- If date removed, remove from calendar
        IF NEW.due_date IS NULL AND OLD.due_date IS NOT NULL THEN
            DELETE FROM public.calendar_events WHERE task_id = NEW.id;
            RETURN NEW;
        END IF;

        -- Normal update
        IF NEW.calendar_event_id IS NOT NULL THEN
            UPDATE public.calendar_events
            SET
                title = NEW.title,
                description = NEW.description,
                date = NEW.due_date,
                time = COALESCE(NEW.reminder_time, '09:00:00'),
                workflow_id = NEW.workflow_id
            WHERE id = NEW.calendar_event_id;
        ELSIF NEW.due_date IS NOT NULL AND NEW.completed = FALSE THEN
             INSERT INTO public.calendar_events (title, description, date, time, type, user_id, task_id, workflow_id)
            VALUES (
                NEW.title,
                NEW.description,
                NEW.due_date,
                COALESCE(NEW.reminder_time, '09:00:00'),
                'task',
                NEW.user_id,
                NEW.id,
                NEW.workflow_id
            )
            RETURNING id INTO new_event_id;
            UPDATE public.tasks SET calendar_event_id = new_event_id WHERE id = NEW.id;
        END IF;
        RETURN NEW;

    -- DELETE
    ELSIF (TG_OP = 'DELETE') THEN
        DELETE FROM public.calendar_events WHERE task_id = OLD.id;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to sync Calendar -> Tasks
CREATE OR REPLACE FUNCTION public.sync_calendar_to_tasks()
RETURNS TRIGGER AS $$
DECLARE
    new_task_id UUID;
BEGIN
    -- Prevent recursion
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    -- INSERT
    IF (TG_OP = 'INSERT') THEN
        BEGIN
            INSERT INTO public.tasks (title, description, due_date, reminder_time, user_id, calendar_event_id, date, workflow_id)
            VALUES (
                NEW.title,
                NEW.description,
                NEW.date,
                CAST(NEW.time AS TIME),
                NEW.user_id,
                NEW.id,
                TO_CHAR(NEW.date, 'YYYY-MM-DD'),
                NEW.workflow_id
            )
            RETURNING id INTO new_task_id;

            UPDATE public.calendar_events SET task_id = new_task_id, type = 'task' WHERE id = NEW.id;
        EXCEPTION WHEN OTHERS THEN
            INSERT INTO public.debug_logs (function_name, message, details)
            VALUES ('sync_calendar_to_tasks', 'Insert failed', jsonb_build_object('error', SQLERRM, 'time', NEW.time));
        END;
        RETURN NEW;

    -- UPDATE
    ELSIF (TG_OP = 'UPDATE') THEN
        IF NEW.task_id IS NOT NULL THEN
            UPDATE public.tasks
            SET
                title = NEW.title,
                description = NEW.description,
                due_date = NEW.date,
                reminder_time = CAST(NEW.time AS TIME),
                workflow_id = NEW.workflow_id
            WHERE id = NEW.task_id;
        END IF;
        RETURN NEW;

    -- DELETE
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.task_id IS NOT NULL THEN
            DELETE FROM public.tasks WHERE id = OLD.task_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
