import { supabase } from '../lib/supabaseClient';

/**
 * Contacts Service
 * Handles all CRUD operations for contacts
 */

// Get all contacts for the current user
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

        // Transform data to include creator info
        const transformedData = data.map(contact => ({
            ...contact,
            creatorAvatar: contact.users?.avatar_url,
            creatorName: contact.users?.full_name || contact.users?.email
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
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching contact:', error);
        return { data: null, error };
    }
};

// Add a new contact
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
            avatar: contact.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`,
            tags: contact.tags || ['New'],
            notes: contact.notes || ''
        };

        const { data, error } = await supabase
            .from('contacts')
            .insert([newContact])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
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
        const { data, error } = await supabase
            .from('contacts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
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
