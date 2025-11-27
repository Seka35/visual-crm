        IF OLD.task_id IS NOT NULL THEN
            DELETE FROM public.tasks WHERE id = OLD.task_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create Triggers
DROP TRIGGER IF EXISTS trigger_sync_tasks_to_calendar ON public.tasks;
CREATE TRIGGER trigger_sync_tasks_to_calendar
AFTER INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.sync_tasks_to_calendar();

DROP TRIGGER IF EXISTS trigger_sync_calendar_to_tasks ON public.calendar_events;
CREATE TRIGGER trigger_sync_calendar_to_tasks
AFTER INSERT OR UPDATE OR DELETE ON public.calendar_events
FOR EACH ROW EXECUTE FUNCTION public.sync_calendar_to_tasks();
