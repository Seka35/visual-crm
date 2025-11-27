import { supabase } from '../lib/supabaseClient';

/**
 * Debts Service
 * Handles all CRUD operations for debts
 */

// Get all debts for the current user and workflow, grouped by status
export const getDebts = async (workflowId) => {
    try {
        let query = supabase
            .from('debts')
            .select('*')
            .order('created_at', { ascending: false });

        // Filter by workflow if provided
        if (workflowId) {
            query = query.eq('workflow_id', workflowId);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Group debts by status
        const groupedDebts = {
            lent: {
                id: 'lent',
                title: 'MONEY LENT',
                color: 'bg-red-700',
                items: []
            },
            partial: {
                id: 'partial',
                title: 'PARTIALLY REPAID',
                color: 'bg-yellow-600',
                items: []
            },
            repaid: {
                id: 'repaid',
                title: 'FULLY REPAID',
                color: 'bg-emerald-700',
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
export const addDebt = async (debt, workflowId) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const newDebt = {
            user_id: user.id,
            workflow_id: workflowId, // Add workflow_id
            borrower_name: debt.borrowerName,
            amount_lent: debt.amountLent,
            amount_repaid: debt.amountRepaid || '$0',
            date_lent: debt.dateLent || new Date().toISOString(),
            reminder_date: debt.reminderDate || null,
            description: debt.description || '',
            status: 'lent'
        };

        // If reminder date is set, create task and event
        if (newDebt.reminder_date) {
            // Create Task
            const { data: taskData, error: taskError } = await supabase
                .from('tasks')
                .insert([{
                    user_id: user.id,
                    workflow_id: workflowId,
                    title: `Collect debt: ${newDebt.borrower_name}`,
                    description: `Collect ${newDebt.amount_lent} from ${newDebt.borrower_name}. Notes: ${newDebt.description}`,
                    date: newDebt.reminder_date,
                    due_date: newDebt.reminder_date,
                    priority: 'high',
                    project: 'Debts'
                }])
                .select()
                .single();

            if (!taskError && taskData) {
                newDebt.related_task_id = taskData.id;
            }

            // Create Event
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .insert([{
                    user_id: user.id,
                    workflow_id: workflowId,
                    title: `Collect debt: ${newDebt.borrower_name}`,
                    description: `Collect ${newDebt.amount_lent} from ${newDebt.borrower_name}`,
                    start_time: newDebt.reminder_date,
                    end_time: new Date(new Date(newDebt.reminder_date).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
                    type: 'task'
                }])
                .select()
                .single();

            if (!eventError && eventData) {
                newDebt.related_event_id = eventData.id;
            }
        }

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
        // Fetch current debt to get related IDs
        const { data: currentDebt } = await supabase
            .from('debts')
            .select('*')
            .eq('id', id)
            .single();

        // Transform camelCase to snake_case for database
        const dbUpdates = {};
        if (updates.borrowerName !== undefined) dbUpdates.borrower_name = updates.borrowerName;
        if (updates.amountLent !== undefined) dbUpdates.amount_lent = updates.amountLent;
        if (updates.amountRepaid !== undefined) dbUpdates.amount_repaid = updates.amountRepaid;
        if (updates.dateLent !== undefined) dbUpdates.date_lent = updates.dateLent;
        if (updates.reminderDate !== undefined) {
            dbUpdates.reminder_date = updates.reminderDate || null;
        }
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;

        // If reminder date is updated, reset reminder_sent
        // if (updates.reminderDate) {
        //     dbUpdates.reminder_sent = false;
        // }

        // Handle Sync Logic
        if (currentDebt) {
            const reminderChanged = updates.reminderDate !== undefined && updates.reminderDate !== currentDebt.reminder_date;
            const reminderRemoved = updates.reminderDate === null || updates.reminderDate === '';
            const newDate = updates.reminderDate;

            if (reminderChanged) {
                if (reminderRemoved) {
                    // Remove related task and event
                    if (currentDebt.related_task_id) {
                        await supabase.from('tasks').delete().eq('id', currentDebt.related_task_id);
                        dbUpdates.related_task_id = null;
                    }
                    if (currentDebt.related_event_id) {
                        await supabase.from('events').delete().eq('id', currentDebt.related_event_id);
                        dbUpdates.related_event_id = null;
                    }
                } else {
                    // Update or Create related task
                    if (currentDebt.related_task_id) {
                        await supabase.from('tasks').update({
                            date: newDate,
                            due_date: newDate,
                            reminder_time: new Date(newDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                            title: `Collect debt: ${updates.borrowerName || currentDebt.borrower_name}`
                        }).eq('id', currentDebt.related_task_id);
                    } else {
                        const { data: taskData } = await supabase.from('tasks').insert([{
                            user_id: currentDebt.user_id,
                            workflow_id: currentDebt.workflow_id,
                            title: `Collect debt: ${updates.borrowerName || currentDebt.borrower_name}`,
                            description: `Collect ${updates.amountLent || currentDebt.amount_lent} from ${updates.borrowerName || currentDebt.borrower_name}`,
                            date: newDate,
                            due_date: newDate,
                            reminder_time: new Date(newDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                            priority: 'high',
                            project: 'Debts'
                        }]).select().single();
                        if (taskData) dbUpdates.related_task_id = taskData.id;
                    }

                    // Update or Create related event
                    if (currentDebt.related_event_id) {
                        await supabase.from('events').update({
                            start_time: newDate,
                            end_time: new Date(new Date(newDate).getTime() + 60 * 60 * 1000).toISOString(),
                            title: `Collect debt: ${updates.borrowerName || currentDebt.borrower_name}`
                        }).eq('id', currentDebt.related_event_id);
                    } else {
                        const { data: eventData } = await supabase.from('events').insert([{
                            user_id: currentDebt.user_id,
                            workflow_id: currentDebt.workflow_id,
                            title: `Collect debt: ${updates.borrowerName || currentDebt.borrower_name}`,
                            description: `Collect ${updates.amountLent || currentDebt.amount_lent} from ${updates.borrowerName || currentDebt.borrower_name}`,
                            start_time: newDate,
                            end_time: new Date(new Date(newDate).getTime() + 60 * 60 * 1000).toISOString(),
                            type: 'task'
                        }]).select().single();
                        if (eventData) dbUpdates.related_event_id = eventData.id;
                    }
                }
            }
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
        // Fetch debt to get related IDs
        const { data: debt } = await supabase
            .from('debts')
            .select('related_task_id, related_event_id')
            .eq('id', id)
            .single();

        if (debt) {
            if (debt.related_task_id) {
                await supabase.from('tasks').delete().eq('id', debt.related_task_id);
            }
            if (debt.related_event_id) {
                await supabase.from('events').delete().eq('id', debt.related_event_id);
            }
        }

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
