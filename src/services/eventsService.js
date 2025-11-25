import { supabase } from '../lib/supabaseClient';

/**
 * Events Service
 * Handles all CRUD operations for calendar events
 */

// Get all events for the current user
// Get all events for the current user
export const getEvents = async (workflowId = null) => {
    try {
        let query = supabase
            .from('calendar_events')
            .select(`
                *,
                users (
                    avatar_url,
                    full_name,
                    email
                )
            `)
            .order('date', { ascending: true });

        if (workflowId) {
            query = query.eq('workflow_id', workflowId);
        } else {
            query = query.is('workflow_id', null);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform snake_case to camelCase and convert date strings to Date objects
        const transformedData = data.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: new Date(event.date),
            time: event.time,
            type: event.type,
            contactId: event.contact_id,
            dealId: event.deal_id,
            createdAt: event.created_at,
            updatedAt: event.updated_at,
            creatorAvatar: event.users?.avatar_url,
            creatorName: event.users?.full_name || event.users?.email
        }));

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error fetching events:', error);
        return { data: [], error };
    }
};

// Get a single event by ID
export const getEvent = async (id) => {
    try {
        const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching event:', error);
        return { data: null, error };
    }
};

// Add a new event
// Add a new event
export const addEvent = async (event, workflowId = null) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const newEvent = {
            user_id: user.id,
            workflow_id: workflowId,
            title: event.title,
            description: event.description || '',
            date: event.date ? new Date(event.date).toISOString() : new Date().toISOString(),
            time: event.time || '09:00',
            type: event.type || 'meeting',
            contact_id: event.contactId || null,
            deal_id: event.dealId || null
        };

        const { data, error } = await supabase
            .from('calendar_events')
            .insert([newEvent])
            .select()
            .single();

        if (error) throw error;

        // Transform response
        const transformedData = {
            id: data.id,
            title: data.title,
            description: data.description,
            date: new Date(data.date),
            time: data.time,
            type: data.type,
            contactId: data.contact_id,
            dealId: data.deal_id
        };

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error adding event:', error);
        return { data: null, error };
    }
};

// Update an existing event
export const updateEvent = async (id, updates) => {
    try {
        // Transform camelCase to snake_case for database
        const dbUpdates = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.date !== undefined) dbUpdates.date = new Date(updates.date).toISOString();
        if (updates.time !== undefined) dbUpdates.time = updates.time;
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.contactId !== undefined) dbUpdates.contact_id = updates.contactId;
        if (updates.dealId !== undefined) dbUpdates.deal_id = updates.dealId;

        const { data, error } = await supabase
            .from('calendar_events')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Transform response
        const transformedData = {
            id: data.id,
            title: data.title,
            description: data.description,
            date: new Date(data.date),
            time: data.time,
            type: data.type,
            contactId: data.contact_id,
            dealId: data.deal_id
        };

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error updating event:', error);
        return { data: null, error };
    }
};

// Delete an event
export const deleteEvent = async (id) => {
    try {
        const { error } = await supabase
            .from('calendar_events')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error deleting event:', error);
        return { error };
    }
};

// Get events for a specific date range
// Get events for a specific date range
export const getEventsByDateRange = async (startDate, endDate, workflowId = null) => {
    try {
        let query = supabase
            .from('calendar_events')
            .select('*')
            .gte('date', startDate.toISOString())
            .lte('date', endDate.toISOString())
            .order('date', { ascending: true });

        if (workflowId) {
            query = query.eq('workflow_id', workflowId);
        } else {
            query = query.is('workflow_id', null);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform data
        const transformedData = data.map(event => ({
            id: event.id,
            title: event.title,
            description: event.description,
            date: new Date(event.date),
            time: event.time,
            type: event.type,
            contactId: event.contact_id,
            dealId: event.deal_id
        }));

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error fetching events by date range:', error);
        return { data: [], error };
    }
};
