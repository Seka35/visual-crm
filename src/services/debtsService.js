import { supabase } from '../lib/supabaseClient';

/**
 * Debts Service
 * Handles all CRUD operations for debts
 */

// Get all debts for the current user, grouped by status
export const getDebts = async () => {
    try {
        const { data, error } = await supabase
            .from('debts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Group debts by status
        const groupedDebts = {
            lent: {
                id: 'lent',
                title: 'MONEY LENT',
                color: 'bg-red-500',
                items: []
            },
            partial: {
                id: 'partial',
                title: 'PARTIALLY REPAID',
                color: 'bg-yellow-500',
                items: []
            },
            repaid: {
                id: 'repaid',
                title: 'FULLY REPAID',
                color: 'bg-green-500',
                items: []
            }
        };

        // Transform and group debts
        data.forEach(debt => {
            if (groupedDebts[debt.status]) {
                groupedDebts[debt.status].items.push(debt);
            }
        });

        return { data: groupedDebts, error: null };
    } catch (error) {
        console.error('Error fetching debts:', error);
        return { data: null, error };
    }
};

// Add a new debt
export const addDebt = async (debt) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const newDebt = {
            user_id: user.id,
            borrower_name: debt.borrowerName,
            amount_lent: debt.amountLent,
            amount_repaid: debt.amountRepaid || '$0',
            date_lent: debt.dateLent || new Date().toISOString(),
            reminder_date: debt.reminderDate || null,
            description: debt.description || '',
            status: 'lent'
        };

        const { data, error } = await supabase
            .from('debts')
            .insert([newDebt])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error adding debt:', error);
        return { data: null, error };
    }
};

// Update an existing debt
export const updateDebt = async (id, updates) => {
    try {
        // Transform camelCase to snake_case for database
        const dbUpdates = {};
        if (updates.borrowerName !== undefined) dbUpdates.borrower_name = updates.borrowerName;
        if (updates.amountLent !== undefined) dbUpdates.amount_lent = updates.amountLent;
        if (updates.amountRepaid !== undefined) dbUpdates.amount_repaid = updates.amountRepaid;
        if (updates.dateLent !== undefined) dbUpdates.date_lent = updates.dateLent;
        if (updates.reminderDate !== undefined) dbUpdates.reminder_date = updates.reminderDate;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;

        // If reminder date is updated, reset reminder_sent
        if (updates.reminderDate) {
            dbUpdates.reminder_sent = false;
        }

        const { data, error } = await supabase
            .from('debts')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating debt:', error);
        return { data: null, error };
    }
};

// Delete a debt
export const deleteDebt = async (id) => {
    try {
        const { error } = await supabase
            .from('debts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error deleting debt:', error);
        return { error };
    }
};

// Move debt to a different status (for drag & drop)
export const moveDebt = async (debtId, newStatus) => {
    return updateDebt(debtId, { status: newStatus });
};
