import { supabase } from '../lib/supabaseClient';

/**
 * Deals Service
 * Handles all CRUD operations for deals
 */

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
                ),
                deal_contacts (
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

        // Group deals by status
        const groupedDeals = {
            lead: {
                id: 'lead',
                title: 'Lead',
                color: 'bg-purple-500',
                items: []
            },
            qualified: {
                id: 'qualified',
                title: 'Qualified',
                color: 'bg-blue-500',
                items: []
            },
            proposal: {
                id: 'proposal',
                title: 'Proposal',
                color: 'bg-emerald-500',
                items: []
            },
            negotiation: {
                id: 'negotiation',
                title: 'Negotiation',
                color: 'bg-amber-500',
                items: []
            },
            won: {
                id: 'won',
                title: 'Won',
                color: 'bg-red-500',
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
                status: deal.status,
                date: deal.date,
                ownerAvatar: deal.users?.avatar_url || deal.owner_avatar,
                ownerName: deal.users?.full_name || deal.users?.email,
                notes: deal.notes,
                contacts: deal.deal_contacts?.map(dc => dc.contact) || [],
                reminder_date: deal.reminder_date,
                reminder_time: deal.reminder_time,
                payment_type: deal.payment_type,
                amount_paid: deal.amount_paid,
                related_task_id: deal.related_task_id
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
            .select(`
                *,
                deal_contacts (
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
            contacts: data.deal_contacts?.map(dc => dc.contact) || []
        };

        return { data: transformedData, error: null };
    } catch (error) {
        console.error('Error fetching deal:', error);
        return { data: null, error };
    }
};

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
            reminder_date: deal.reminder_date || null,
            reminder_time: deal.reminder_time || null,
            payment_type: deal.payment_type || 'one-time',
            amount_paid: deal.amount_paid || 0
        };

        const { data, error } = await supabase
            .from('deals')
            .insert([newDeal])
            .select()
            .single();

        if (error) throw error;

        // Handle contacts association
        let associatedContacts = [];
        if (deal.contactIds && deal.contactIds.length > 0) {
            const contactsToInsert = deal.contactIds.map(cid => ({
                deal_id: data.id,
                contact_id: cid
            }));
            const { error: contactsError } = await supabase
                .from('deal_contacts')
                .insert(contactsToInsert);

            if (contactsError) console.error('Error associating contacts:', contactsError);

            // Fetch the associated contacts details for the return object
            if (!contactsError) {
                const { data: contactsData } = await supabase
                    .from('contacts')
                    .select('id, name, avatar')
                    .in('id', deal.contactIds);
                associatedContacts = contactsData || [];
            }
        }

        return { data: { ...data, contacts: associatedContacts }, error: null };
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
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.amount !== undefined) {
            dbUpdates.amount = updates.amount;
            dbUpdates.amount_value = parseFloat(updates.amount.replace(/[^0-9.-]+/g, '') || '0');
        }
        if (updates.probability !== undefined) dbUpdates.probability = updates.probability;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.reminder_date !== undefined) dbUpdates.reminder_date = updates.reminder_date;
        if (updates.reminder_time !== undefined) dbUpdates.reminder_time = updates.reminder_time;
        if (updates.payment_type !== undefined) dbUpdates.payment_type = updates.payment_type;
        if (updates.amount_paid !== undefined) dbUpdates.amount_paid = updates.amount_paid;
        if (updates.related_task_id !== undefined) dbUpdates.related_task_id = updates.related_task_id;

        const { data, error } = await supabase
            .from('deals')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Handle contacts updates
        let associatedContacts = [];
        if (updates.contactIds !== undefined) {
            // Delete existing associations
            await supabase.from('deal_contacts').delete().eq('deal_id', id);

            // Insert new associations
            if (updates.contactIds.length > 0) {
                const contactsToInsert = updates.contactIds.map(cid => ({
                    deal_id: id,
                    contact_id: cid
                }));
                await supabase.from('deal_contacts').insert(contactsToInsert);

                const { data: contactsData } = await supabase
                    .from('contacts')
                    .select('id, name, avatar')
                    .in('id', updates.contactIds);
                associatedContacts = contactsData || [];
            }
        } else {
            // If not updating contacts, fetch existing ones to return complete object
            const { data: existingContacts } = await supabase
                .from('deal_contacts')
                .select('contact:contacts(id, name, avatar)')
                .eq('deal_id', id);
            associatedContacts = existingContacts?.map(ec => ec.contact) || [];
        }

        return { data: { ...data, contacts: associatedContacts }, error: null };
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
