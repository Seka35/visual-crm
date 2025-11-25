import { supabase } from '../lib/supabaseClient';

/**
 * Deals Service
 * Handles all CRUD operations for deals
 */

// Get all deals for the current user, grouped by status
// Get all deals for the current user, grouped by status
export const getDeals = async (workflowId = null) => {
    try {
        let query = supabase
            .from('deals')
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

        // Group deals by status
        const groupedDeals = {
            lead: {
                id: 'lead',
                title: 'Lead',
                color: 'bg-slate-400',
                items: []
            },
            qualified: {
                id: 'qualified',
                title: 'Qualified',
                color: 'bg-primary',
                items: []
            },
            proposal: {
                id: 'proposal',
                title: 'Proposal',
                color: 'bg-secondary',
                items: []
            },
            negotiation: {
                id: 'negotiation',
                title: 'Negotiation',
                color: 'bg-warning',
                items: []
            },
            won: {
                id: 'won',
                title: 'Won',
                color: 'bg-success',
                items: []
            }
        };

        // Transform and group deals
        data.forEach(deal => {
            const transformedDeal = {
                id: deal.id,
                title: deal.title,
                clientName: deal.client_name,
                clientLogo: deal.client_logo,
                amount: deal.amount,
                probability: deal.probability,
                date: deal.date,
                ownerAvatar: deal.users?.avatar_url || deal.owner_avatar,
                ownerName: deal.users?.full_name || deal.users?.email,
                notes: deal.notes,
                contactId: deal.contact_id
            };

            if (groupedDeals[deal.status]) {
                groupedDeals[deal.status].items.push(transformedDeal);
            }
        });

        return { data: groupedDeals, error: null };
    } catch (error) {
        console.error('Error fetching deals:', error);
        return { data: null, error };
    }
};

// Get a single deal by ID
export const getDeal = async (id) => {
    try {
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching deal:', error);
        return { data: null, error };
    }
};

// Add a new deal
// Add a new deal
export const addDeal = async (deal, workflowId = null) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const newDeal = {
            user_id: user.id,
            workflow_id: workflowId,
            title: deal.title,
            client_name: deal.clientName || 'New Client',
            client_logo: deal.clientLogo || `https://api.dicebear.com/7.x/identicon/svg?seed=${deal.title}`,
            amount: deal.amount || '$0',
            amount_value: parseFloat(deal.amount?.replace(/[^0-9.-]+/g, '') || '0'),
            probability: deal.probability || 10,
            status: deal.status || 'lead',
            date: deal.date || new Date().toLocaleDateString(),
            owner_avatar: deal.ownerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
            notes: deal.notes || '',
            contact_id: deal.contactId || null
        };

        const { data, error } = await supabase
            .from('deals')
            .insert([newDeal])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error adding deal:', error);
        return { data: null, error };
    }
};

// Update an existing deal
export const updateDeal = async (id, updates) => {
    try {
        // Transform camelCase to snake_case for database
        const dbUpdates = {};
        if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
        if (updates.clientLogo !== undefined) dbUpdates.client_logo = updates.clientLogo;
        if (updates.ownerAvatar !== undefined) dbUpdates.owner_avatar = updates.ownerAvatar;
        if (updates.contactId !== undefined) dbUpdates.contact_id = updates.contactId;
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.amount !== undefined) {
            dbUpdates.amount = updates.amount;
            dbUpdates.amount_value = parseFloat(updates.amount.replace(/[^0-9.-]+/g, '') || '0');
        }
        if (updates.probability !== undefined) dbUpdates.probability = updates.probability;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

        const { data, error } = await supabase
            .from('deals')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating deal:', error);
        return { data: null, error };
    }
};

// Delete a deal
export const deleteDeal = async (id) => {
    try {
        const { error } = await supabase
            .from('deals')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error deleting deal:', error);
        return { error };
    }
};

// Move deal to a different status (for drag & drop)
export const moveDeal = async (dealId, newStatus) => {
    return updateDeal(dealId, { status: newStatus });
};
