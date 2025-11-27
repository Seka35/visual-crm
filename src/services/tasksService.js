import { supabase } from '../lib/supabaseClient';

/**
 * Tasks Service
 * Handles all CRUD operations for tasks
 */

// Get all tasks for the current user
// Get all tasks for the current user
export const getTasks = async (workflowId = null) => {
    try {
        let query = supabase
            .from('tasks')
            .select(`
                *,
                users (
                    avatar_url,
                    full_name,
                    email
                ),
                task_contacts (
                    contact: contacts (
                        id,
                        name,
                        avatar
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (workflowId) {
            query = query.eq('workflow_id', workflowId);
        } else {
            query = query.is('workflow_id', null);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Transform snake_case to camelCase
        const transformedData = data.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            date: task.date,
            dueDate: task.due_date,
            reminderTime: task.reminder_time,
            priority: task.priority,
            project: task.project,
            assigneeAvatar: task.users?.avatar_url || task.assignee_avatar,
            assigneeName: task.users?.full_name || task.users?.email,
            completed: task.completed,
            contacts: task.task_contacts?.map(tc => tc.contact) || [],
            createdAt: task.created_at,
            updatedAt: task.updated_at
        }));

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return { data: [], error };
    }
};

// Get a single task by ID
export const getTask = async (id) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                task_contacts (
                    contact: contacts (
                        id,
                        name,
                        avatar
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        const transformedData = {
            ...data,
            contacts: data.task_contacts?.map(tc => tc.contact) || []
        };

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error fetching task:', error);
        return { data: null, error };
    }
};

// Add a new task
export const addTask = async (task, workflowId = null) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const newTask = {
            user_id: user.id,
            workflow_id: workflowId,
            title: task.title,
            description: task.description || '',
            date: task.date || 'Today',
            due_date: task.dueDate || null,
            reminder_time: task.reminderTime || null,
            priority: task.priority || 'medium',
            project: task.project || 'General',
            assignee_avatar: task.assigneeAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
            completed: task.completed || false
        };

        const { data, error } = await supabase
            .from('tasks')
            .insert([newTask])
            .select()
            .single();

        if (error) throw error;

        // Handle contacts association
        let associatedContacts = [];
        if (task.contactIds && task.contactIds.length > 0) {
            const contactsToInsert = task.contactIds.map(cid => ({
                task_id: data.id,
                contact_id: cid
            }));
            const { error: contactsError } = await supabase
                .from('task_contacts')
                .insert(contactsToInsert);

            if (contactsError) console.error('Error associating contacts:', contactsError);

            // Fetch the associated contacts details for the return object
            if (!contactsError) {
                const { data: contactsData } = await supabase
                    .from('contacts')
                    .select('id, name, avatar')
                    .in('id', task.contactIds);
                associatedContacts = contactsData || [];
            }
        }

        // Transform response
        const transformedData = {
            id: data.id,
            title: data.title,
            description: data.description,
            date: data.date,
            dueDate: data.due_date,
            reminderTime: data.reminder_time,
            priority: data.priority,
            project: data.project,
            assigneeAvatar: data.assignee_avatar,
            completed: data.completed,
            contacts: associatedContacts
        };

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error adding task:', error);
        return { data: null, error };
    }
};

// Update an existing task
export const updateTask = async (id, updates) => {
    try {
        // Transform camelCase to snake_case for database
        const dbUpdates = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.reminderTime !== undefined) dbUpdates.reminder_time = updates.reminderTime;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.project !== undefined) dbUpdates.project = updates.project;
        if (updates.assigneeAvatar !== undefined) dbUpdates.assignee_avatar = updates.assigneeAvatar;
        if (updates.completed !== undefined) dbUpdates.completed = updates.completed;

        const { data, error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Handle contacts updates
        let associatedContacts = [];
        if (updates.contactIds !== undefined) {
            // Delete existing associations
            await supabase.from('task_contacts').delete().eq('task_id', id);

            // Insert new associations
            if (updates.contactIds.length > 0) {
                const contactsToInsert = updates.contactIds.map(cid => ({
                    task_id: id,
                    contact_id: cid
                }));
                await supabase.from('task_contacts').insert(contactsToInsert);

                const { data: contactsData } = await supabase
                    .from('contacts')
                    .select('id, name, avatar')
                    .in('id', updates.contactIds);
                associatedContacts = contactsData || [];
            }
        } else {
            // If not updating contacts, fetch existing ones to return complete object
            const { data: existingContacts } = await supabase
                .from('task_contacts')
                .select('contact:contacts(id, name, avatar)')
                .eq('task_id', id);
            associatedContacts = existingContacts?.map(ec => ec.contact) || [];
        }

        // Transform response
        const transformedData = {
            id: data.id,
            title: data.title,
            description: data.description,
            date: data.date,
            dueDate: data.due_date,
            reminderTime: data.reminder_time,
            priority: data.priority,
            project: data.project,
            assigneeAvatar: data.assignee_avatar,
            completed: data.completed,
            contacts: associatedContacts
        };

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error updating task:', error);
        return { data: null, error };
    }
};

// Toggle task completion status
export const toggleTask = async (id) => {
    try {
        // First get the current task
        const { data: currentTask, error: fetchError } = await supabase
            .from('tasks')
            .select('completed')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Toggle the completed status
        const { data, error } = await supabase
            .from('tasks')
            .update({ completed: !currentTask.completed })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error toggling task:', error);
        return { data: null, error };
    }
};

// Delete a task
export const deleteTask = async (id) => {
    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { error };
    }
};
