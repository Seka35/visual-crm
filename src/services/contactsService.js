import { supabase } from '../lib/supabaseClient';

/**
 * Contacts Service
 * Handles all CRUD operations for contacts
 */

// Get all contacts for the current workflow
export const getContacts = async (workflowId = null) => {
    try {
        let query = supabase
            .from('contacts')
            .select(`
                *,
                users (
                    avatar_url,
                    full_name,
                    email
                ),
                task_contacts (
                    task: tasks (
                        id,
                        title,
                        completed
                    )
                ),
                deal_contacts (
                    deal: deals (
                        id,
                        title,
                        amount,
                        status
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

        // Transform data to include creator info and associations
        const transformedData = data.map(contact => ({
            ...contact,
            creatorAvatar: contact.users?.avatar_url,
            creatorName: contact.users?.full_name || contact.users?.email,
            tasks: contact.task_contacts?.map(tc => tc.task) || [],
            deals: contact.deal_contacts?.map(dc => dc.deal) || []
        }));

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return { data: [], error };
    }
};

// Get a single contact by ID
export const getContact = async (id) => {
    try {
        const { data, error } = await supabase
            .from('contacts')
            .select(`
                *,
                task_contacts (
                    task: tasks (
                        id,
                        title,
                        completed
                    )
                ),
                deal_contacts (
                    deal: deals (
                        id,
                        title,
                        amount,
                        status
                    )
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        const transformedData = {
            ...data,
            tasks: data.task_contacts?.map(tc => tc.task) || [],
            deals: data.deal_contacts?.map(dc => dc.deal) || []
        };

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error fetching contact:', error);
        return { data: null, error };
    }
};

// Add a new contact
export const addContact = async (contact, workflowId = null) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const newContact = {
            user_id: user.id,
            workflow_id: workflowId,
            name: contact.name,
            role: contact.role || '',
            company: contact.company || '',
            email: contact.email || '',
            phone: contact.phone || '',
            status: contact.status || 'New',
            last_contact: contact.lastContact || 'Just now',
            avatar: contact.avatar || null,
            tags: contact.tags || ['New'],
            notes: contact.notes || ''
        };

        const { data, error } = await supabase
            .from('contacts')
            .insert([newContact])
            .select()
            .single();

        if (error) throw error;

        // Handle associations
        if (contact.taskIds && contact.taskIds.length > 0) {
            const tasksToInsert = contact.taskIds.map(tid => ({
                contact_id: data.id,
                task_id: tid
            }));
            await supabase.from('task_contacts').insert(tasksToInsert);
        }

        if (contact.dealIds && contact.dealIds.length > 0) {
            const dealsToInsert = contact.dealIds.map(did => ({
                contact_id: data.id,
                deal_id: did
            }));
            await supabase.from('deal_contacts').insert(dealsToInsert);
        }

        // Fetch complete object with associations for return
        const { data: completeContact } = await getContact(data.id);
        return { data: completeContact, error: null };

    } catch (error) {
        console.error('Error adding contact:', error.message);
        if (error.details) console.error('Error details:', error.details);
        if (error.hint) console.error('Error hint:', error.hint);
        return { data: null, error };
    }
};

// Update an existing contact
export const updateContact = async (id, updates) => {
    try {
        const dbUpdates = { ...updates };
        delete dbUpdates.taskIds;
        delete dbUpdates.dealIds;

        const { data, error } = await supabase
            .from('contacts')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Handle associations updates
        if (updates.taskIds !== undefined) {
            await supabase.from('task_contacts').delete().eq('contact_id', id);
            if (updates.taskIds.length > 0) {
                const tasksToInsert = updates.taskIds.map(tid => ({
                    contact_id: id,
                    task_id: tid
                }));
                await supabase.from('task_contacts').insert(tasksToInsert);
            }
        }

        if (updates.dealIds !== undefined) {
            await supabase.from('deal_contacts').delete().eq('contact_id', id);
            if (updates.dealIds.length > 0) {
                const dealsToInsert = updates.dealIds.map(did => ({
                    contact_id: id,
                    deal_id: did
                }));
                await supabase.from('deal_contacts').insert(dealsToInsert);
            }
        }

        // Fetch complete object with associations for return
        const { data: completeContact } = await getContact(id);
        return { data: completeContact, error: null };
    } catch (error) {
        console.error('Error updating contact:', error);
        return { data: null, error };
    }
};

// Delete a contact
export const deleteContact = async (id) => {
    try {
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error deleting contact:', error);
        return { error };
    }
};

// Search contacts by name, email, or company
export const searchContacts = async (query, workflowId = null) => {
    try {
        let dbQuery = supabase
            .from('contacts')
            .select('*')
            .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (workflowId) {
            dbQuery = dbQuery.eq('workflow_id', workflowId);
        } else {
            dbQuery = dbQuery.is('workflow_id', null);
        }

        const { data, error } = await dbQuery;

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error searching contacts:', error);
        return { data: [], error };
    }
};
