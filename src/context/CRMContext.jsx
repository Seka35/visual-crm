import React, { createContext, useContext, useState, useEffect } from 'react';
import * as contactsService from '../services/contactsService';
import * as dealsService from '../services/dealsService';
import * as tasksService from '../services/tasksService';
import * as eventsService from '../services/eventsService';

import * as debtsService from '../services/debtsService';
import * as authService from '../services/authService';
import * as workflowService from '../services/workflowService';
import { useWorkflow } from './WorkflowContext';

const CRMContext = createContext();

export const useCRM = () => {
    const context = useContext(CRMContext);
    if (!context) {
        throw new Error('useCRM must be used within a CRMProvider');
    }
    return context;
};

export const CRMProvider = ({ children }) => {
    const { currentWorkflow } = useWorkflow();
    const currentWorkflowId = currentWorkflow?.id || null;

    // --- Auth State ---
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // --- Loading & Error States ---
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Contacts State ---
    const [contacts, setContacts] = useState([]);

    // --- Deals State ---
    const [deals, setDeals] = useState({
        lead: { id: 'lead', title: 'Lead', color: 'bg-purple-500', items: [] },
        qualified: { id: 'qualified', title: 'Qualified', color: 'bg-blue-500', items: [] },
        proposal: { id: 'proposal', title: 'Proposal', color: 'bg-emerald-500', items: [] },
        negotiation: { id: 'negotiation', title: 'Negotiation', color: 'bg-amber-500', items: [] },
        won: { id: 'won', title: 'Won', color: 'bg-red-500', items: [] }
    });

    // --- Tasks State ---
    const [tasks, setTasks] = useState([]);
    const [folders, setFolders] = useState([]);

    // --- Events State (Calendar) ---
    const [events, setEvents] = useState([]);

    // --- Debts State ---
    const [debts, setDebts] = useState({
        lent: { id: 'lent', title: 'MONEY LENT', color: 'bg-red-700', items: [] },
        partial: { id: 'partial', title: 'PARTIALLY REPAID', color: 'bg-yellow-600', items: [] },
        repaid: { id: 'repaid', title: 'FULLY REPAID', color: 'bg-emerald-700', items: [] }
    });

    // --- Auth Effects ---
    useEffect(() => {
        // Check for existing session
        authService.getSession().then(async ({ session }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                await authService.ensureUserProfile(session.user);
            }
            setAuthLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setAuthLoading(false);

            // Load data when user signs in
            if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session)) {
                if (session?.user) {
                    await authService.ensureUserProfile(session.user);
                    // loadAllData will be triggered by the user dependency in the other useEffect
                }
            }

            // Clear data when user signs out
            if (event === 'SIGNED_OUT') {
                setContacts([]);
                setDeals({
                    lead: { id: 'lead', title: 'Lead', color: 'bg-slate-400', items: [] },
                    qualified: { id: 'qualified', title: 'Qualified', color: 'bg-primary', items: [] },
                    proposal: { id: 'proposal', title: 'Proposal', color: 'bg-secondary', items: [] },
                    negotiation: { id: 'negotiation', title: 'Negotiation', color: 'bg-warning', items: [] },
                    won: { id: 'won', title: 'Won', color: 'bg-success', items: [] }
                });
                setTasks([]);
                setFolders([]);
                setEvents([]);
                setDebts({
                    lent: { id: 'lent', title: 'MONEY LENT', color: 'bg-red-500', items: [] },
                    partial: { id: 'partial', title: 'PARTIALLY REPAID', color: 'bg-yellow-500', items: [] },
                    repaid: { id: 'repaid', title: 'FULLY REPAID', color: 'bg-green-500', items: [] }
                });
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    // --- Load all data when user is authenticated OR workflow changes ---
    useEffect(() => {
        if (user) {
            loadAllData();
        }
    }, [user, currentWorkflowId]);

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([
            loadContacts(),
            loadDeals(),
            loadTasks(),
            loadFolders(),
            loadEvents(),
            loadDebts()
        ]);
        setLoading(false);
    };

    // --- Contacts Functions ---
    const loadContacts = async () => {
        const { data, error } = await contactsService.getContacts(currentWorkflowId);
        if (error) {
            console.error('Error loading contacts:', error);
            setError(error.message);
        } else {
            // Transform to match existing format
            const transformedContacts = data.map(c => ({
                id: c.id,
                name: c.name,
                role: c.role,
                company: c.company,
                email: c.email,
                phone: c.phone,
                status: c.status,
                lastContact: c.last_contact,
                avatar: c.avatar,
                tags: c.tags || [],
                notes: c.notes
            }));
            setContacts(transformedContacts);
        }
    };

    const addContact = async (contact) => {
        const { data, error } = await contactsService.addContact(contact, currentWorkflowId);
        if (error) {
            console.error('Error adding contact:', error);
            setError(error.message);
            return null;
        } else {
            const transformedContact = {
                id: data.id,
                name: data.name,
                role: data.role,
                company: data.company,
                email: data.email,
                phone: data.phone,
                status: data.status,
                lastContact: data.last_contact,
                avatar: data.avatar,
                tags: data.tags || [],
                notes: data.notes
            };
            setContacts(prev => [transformedContact, ...prev]);
            return transformedContact;
        }
    };

    const updateContact = async (id, updates) => {
        const { data, error } = await contactsService.updateContact(id, updates);
        if (error) {
            console.error('Error updating contact:', error);
            setError(error.message);
        } else {
            await loadContacts(); // Reload to get fresh data
        }
    };

    const deleteContact = async (id) => {
        const { error } = await contactsService.deleteContact(id);
        if (error) {
            console.error('Error deleting contact:', error);
            setError(error.message);
        } else {
            setContacts(prev => prev.filter(c => c.id !== id));
        }
    };

    // --- Tasks Functions ---
    const loadTasks = async () => {
        const { data, error } = await tasksService.getTasks(currentWorkflowId);
        if (error) {
            console.error('Error loading tasks:', error);
            setError(error.message);
        } else {
            setTasks(data);
        }
    };

    const addTask = async (task) => {
        const { data, error } = await tasksService.addTask(task, currentWorkflowId);
        if (error) {
            console.error('Error adding task:', error);
            await loadTasks();
            await loadContacts();
            return { data: null, error };
        } else {
            // Create notification if reminder is set and not skipped
            if (task.dueDate && !task.skipNotification && user) {
                await workflowService.createNotification({
                    user_id: user.id,
                    type: 'reminder',
                    content: `Mission Reminder: ${task.title}`,
                    data: { type: 'task', id: data.id, path: '/tasks' }
                });
            }

            setTasks(prev => [data, ...prev]);
            return { data, error: null };
        }
    };

    const toggleTask = async (id) => {
        const { data, error } = await tasksService.toggleTask(id);
        if (error) {
            console.error('Error toggling task:', error);
            setError(error.message);
        } else {
            const updatedTask = { ...tasks.find(t => t.id === id), completed: !tasks.find(t => t.id === id).completed };
            setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

            // If task is completed, clear reminders from linked Deals or Debts
            if (updatedTask.completed) {
                // Check Deals
                for (const key in deals) {
                    const deal = deals[key].items.find(d => d.related_task_id === id);
                    if (deal) {
                        await dealsService.updateDeal(deal.id, { reminder_date: null, reminder_time: null });
                        await loadDeals();
                        break;
                    }
                }

                // Check Debts
                let debtFound = null;
                for (const key in debts) {
                    const found = debts[key].items.find(d => d.related_task_id === id);
                    if (found) {
                        debtFound = found;
                        break;
                    }
                }

            }
        }
    };

    const updateTask = async (id, updates) => {
        const { data, error } = await tasksService.updateTask(id, updates);
        if (error) {
            console.error('Error updating task:', error);
            setError(error.message);
        } else {
            // Create notification if reminder is set/changed and not skipped
            if (updates.dueDate && !updates.skipNotification && user) {
                await workflowService.createNotification({
                    user_id: user.id,
                    type: 'reminder',
                    content: `Mission Updated: ${updates.title || data.title}`,
                    data: { type: 'task', id: id, path: '/tasks' }
                });
            }

            await loadTasks();
            await loadContacts();
        }
    };

    const deleteTask = async (id) => {
        const { error } = await tasksService.deleteTask(id);
        if (error) {
            console.error('Error deleting task:', error);
            setError(error.message);
        } else {
            setTasks(prev => prev.filter(t => t.id !== id));
            await loadContacts();
        }
    };

    const loadFolders = async () => {
        const { data, error } = await tasksService.getFolders(currentWorkflowId);
        if (error) {
            console.error('Error loading folders:', error);
            setError(error.message);
        } else {
            setFolders(data);
        }
    };

    const addFolder = async (folder) => {
        const { data, error } = await tasksService.createFolder(folder, currentWorkflowId);
        if (error) {
            console.error('Error adding folder:', error);
            setError(error.message);
            return { data: null, error };
        } else {
            setFolders(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
            return { data, error: null };
        }
    };

    // --- Deals Functions ---
    const loadDeals = async () => {
        const { data, error } = await dealsService.getDeals(currentWorkflowId);
        if (error) {
            console.error('Error loading deals:', error);
            setError(error.message);
        } else {
            setDeals(data);
        }
    };

    const addDeal = async (deal) => {
        // Ensure we are passing the currentWorkflowId to the service
        const { data, error } = await dealsService.addDeal(deal, currentWorkflowId);
        if (error) {
            console.error('Error adding deal:', error);
            setError(error.message);
            return null;
        } else {
            // Sync to Tasks if reminder is set
            if (deal.reminder_date) {
                try {
                    const taskData = {
                        title: `Follow up on deal: ${deal.title}`,
                        description: `Reminder for deal: ${deal.title}\nNotes: ${deal.notes || ''}`,
                        dueDate: deal.reminder_date,
                        reminderTime: deal.reminder_time || '09:00',
                        contactIds: deal.contactIds || [],
                        project: 'Deals',
                        priority: 'high',
                        skipNotification: true // Skip task notification, we handle it here
                    };

                    const { data: taskDataResponse, error: taskError } = await addTask(taskData);

                    if (taskDataResponse && !taskError) {
                        await dealsService.updateDeal(data.id, { related_task_id: taskDataResponse.id });
                    }

                    // Create Deal Notification
                    if (user) {
                        await workflowService.createNotification({
                            user_id: user.id,
                            type: 'reminder',
                            content: `Deal Reminder: ${deal.title}`,
                            data: { type: 'deal', id: data.id, path: '/deals' }
                        });
                    }
                } catch (e) {
                    console.error("Error syncing deal to task", e);
                }
            }

            await loadDeals(); // Reload to get fresh grouped data
            await loadContacts();
            return data;
        }
    };

    const updateDeal = async (id, updates) => {
        // Find current deal for context
        let currentDeal = null;
        for (const key in deals) {
            const found = deals[key].items.find(d => d.id === id);
            if (found) {
                currentDeal = found;
                break;
            }
        }

        const { data, error } = await dealsService.updateDeal(id, updates);
        if (error) {
            console.error('Error updating deal:', error);
            setError(error.message);
        } else {
            // Sync logic
            if (currentDeal) {
                try {
                    const newDate = updates.reminder_date !== undefined ? updates.reminder_date : currentDeal.reminder_date;
                    const newTime = updates.reminder_time !== undefined ? updates.reminder_time : currentDeal.reminder_time;
                    const hasReminder = !!newDate;
                    const hadReminder = !!currentDeal.reminder_date;
                    const taskId = currentDeal.related_task_id;

                    if (hasReminder && (!hadReminder || !taskId)) {
                        // Created reminder OR Reminder exists but no task (legacy) -> Create task
                        const taskData = {
                            title: `Follow up on deal: ${updates.title || currentDeal.title}`,
                            description: `Reminder for deal: ${updates.title || currentDeal.title}`,
                            dueDate: newDate,
                            reminderTime: newTime || '09:00',
                            contactIds: updates.contactIds || currentDeal.contactIds || [],
                            project: 'Deals',
                            priority: 'high',
                            skipNotification: true
                        };
                        const { data: taskRes } = await addTask(taskData);
                        if (taskRes) {
                            await dealsService.updateDeal(id, { related_task_id: taskRes.id });

                            // Create Notification
                            if (user) {
                                await workflowService.createNotification({
                                    user_id: user.id,
                                    type: 'reminder',
                                    content: `Deal Reminder: ${updates.title || currentDeal.title}`,
                                    data: { type: 'deal', id: id, path: '/deals' }
                                });
                            }
                        }
                    } else if (!hasReminder && hadReminder) {
                        // Removed reminder -> Delete task ONLY if it's not completed
                        if (taskId) {
                            // Check if task is completed
                            const task = tasks.find(t => t.id === taskId);
                            if (task && !task.completed) {
                                await deleteTask(taskId);
                            }
                            // Always unlink from deal
                            await dealsService.updateDeal(id, { related_task_id: null });
                        }
                    } else if (hasReminder && taskId) {
                        // Updated reminder -> Update task
                        // Check if relevant fields changed
                        if (updates.reminder_date || updates.reminder_time || updates.title) {
                            await updateTask(taskId, {
                                dueDate: newDate,
                                reminderTime: newTime,
                                title: updates.title ? `Follow up on deal: ${updates.title}` : undefined,
                                skipNotification: true
                            });

                            // Create Notification
                            if (user) {
                                await workflowService.createNotification({
                                    user_id: user.id,
                                    type: 'reminder',
                                    content: `Deal Reminder Updated: ${updates.title || currentDeal.title}`,
                                    data: { type: 'deal', id: id, path: '/deals' }
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error syncing deal update to task", e);
                }
            }

            await loadDeals(); // Reload to get fresh grouped data
            await loadContacts();
        }
    };

    const updateDeals = async (newDealsState) => {
        // This is called during drag & drop
        // We need to update the status of moved deals
        setDeals(newDealsState);
    };

    const moveDeal = async (dealId, newStatus) => {
        const { error } = await dealsService.moveDeal(dealId, newStatus);
        if (error) {
            console.error('Error moving deal:', error);
            setError(error.message);
        }
    };

    const deleteDeal = async (id) => {
        const { error } = await dealsService.deleteDeal(id);
        if (error) {
            console.error('Error deleting deal:', error);
            setError(error.message);
        } else {
            await loadDeals();
            await loadContacts();
        }
    };

    // --- Events Functions ---
    const loadEvents = async () => {
        const { data, error } = await eventsService.getEvents(currentWorkflowId);
        if (error) {
            console.error('Error loading events:', error);
            setError(error.message);
        } else {
            setEvents(data);
        }
    };

    const addEvent = async (event) => {
        const { data, error } = await eventsService.addEvent(event, currentWorkflowId);
        if (error) {
            console.error('Error adding event:', error);
            setError(error.message);
            return null;
        } else {
            setEvents(prev => [data, ...prev]);
            return data;
        }
    };

    const updateEvent = async (id, updatedEvent) => {
        const { data, error } = await eventsService.updateEvent(id, updatedEvent);
        if (error) {
            console.error('Error updating event:', error);
            setError(error.message);
        } else {
            setEvents(prev => prev.map(e => e.id === id ? data : e));
        }
    };

    const deleteEvent = async (id) => {
        const { error } = await eventsService.deleteEvent(id);
        if (error) {
            console.error('Error deleting event:', error);
            setError(error.message);
        } else {
            setEvents(prev => prev.filter(e => e.id !== id));
        }
    };

    // --- Debts Functions ---
    const loadDebts = async () => {
        const { data, error } = await debtsService.getDebts(currentWorkflowId);
        if (error) {
            console.error('Error loading debts:', error);
            setError(error.message);
        } else {
            setDebts(data);
        }
    };

    const addDebt = async (debt) => {
        // Convert reminderDate to ISO string for DB if present
        const dbDebt = { ...debt };
        if (debt.reminderDate) {
            dbDebt.reminderDate = new Date(debt.reminderDate).toISOString();
        }

        const { data, error } = await debtsService.addDebt(dbDebt, currentWorkflowId);
        if (error) {
            console.error('Error adding debt:', error);
            setError(error.message);
            return null;
        } else {
            // Sync to Tasks if reminder is set
            if (debt.reminderDate) {
                try {
                    // Use the original local time string for the task to preserve user intent
                    const [datePart, timePart] = debt.reminderDate.split('T');

                    const taskData = {
                        title: `Follow up on debt: ${debt.borrowerName}`,
                        description: `Reminder for debt: ${debt.description || 'No description'}\nAmount: ${debt.amountLent}`,
                        dueDate: datePart,
                        reminderTime: timePart || '09:00',
                        contactIds: [], // Could link to contact if we had contact selection
                        project: 'Debts',
                        priority: 'high',
                        skipNotification: true // Skip task notification
                    };

                    const { data: taskDataResponse, error: taskError } = await addTask(taskData);

                    if (taskDataResponse && !taskError) {
                        await debtsService.updateDebt(data.id, { related_task_id: taskDataResponse.id });
                    }

                    // Create Debt Notification
                    if (user) {
                        await workflowService.createNotification({
                            user_id: user.id,
                            type: 'reminder',
                            content: `Debt Reminder: ${debt.borrowerName}`,
                            data: { type: 'debt', id: data.id, path: '/debts' }
                        });
                    }
                } catch (e) {
                    console.error("Error syncing debt to task", e);
                }
            }

            await loadDebts();
            return data;
        }
    };

    const updateDebt = async (id, updates) => {
        // Find current debt for context
        let currentDebt = null;
        for (const key in debts) {
            const found = debts[key].items.find(d => d.id === id);
            if (found) {
                currentDebt = found;
                break;
            }
        }

        // Convert reminderDate to ISO string for DB if present
        const dbUpdates = { ...updates };
        if (updates.reminderDate) {
            dbUpdates.reminderDate = new Date(updates.reminderDate).toISOString();
        }

        const { data, error } = await debtsService.updateDebt(id, dbUpdates);
        if (error) {
            console.error('Error updating debt:', error);
            setError(error.message);
        } else {
            // Sync logic
            if (currentDebt) {
                try {
                    const newDateStr = updates.reminderDate; // This is the local datetime string from input
                    const hasNewReminder = !!newDateStr;
                    const hadReminder = !!currentDebt.reminder_date;
                    const taskId = currentDebt.related_task_id;

                    if (hasNewReminder && (!hadReminder || !taskId)) {
                        // Created reminder OR Reminder exists but no task (legacy) -> Create task
                        const [datePart, timePart] = newDateStr.split('T');
                        const taskData = {
                            title: `Follow up on debt: ${updates.borrowerName || currentDebt.borrower_name}`,
                            description: `Reminder for debt: ${updates.description || currentDebt.description || 'No description'}`,
                            dueDate: datePart,
                            reminderTime: timePart || '09:00',
                            contactIds: [],
                            project: 'Debts',
                            priority: 'high',
                            skipNotification: true
                        };
                        const { data: taskRes } = await addTask(taskData);
                        if (taskRes) {
                            await debtsService.updateDebt(id, { related_task_id: taskRes.id });

                            // Create Notification
                            if (user) {
                                await workflowService.createNotification({
                                    user_id: user.id,
                                    type: 'reminder',
                                    content: `Debt Reminder: ${updates.borrowerName || currentDebt.borrower_name}`,
                                    data: { type: 'debt', id: id, path: '/debts' }
                                });
                            }
                        }
                    } else if (!hasNewReminder && hadReminder && updates.reminderDate === null) {
                        // Removed reminder -> Delete task ONLY if it's not completed
                        if (taskId) {
                            // Check if task is completed
                            const task = tasks.find(t => t.id === taskId);
                            if (task && !task.completed) {
                                await deleteTask(taskId);
                            }
                            // Always unlink from debt
                            await debtsService.updateDebt(id, { related_task_id: null });
                        }
                    } else if (hasNewReminder && taskId) {
                        // Updated reminder -> Update task
                        const [datePart, timePart] = newDateStr.split('T');
                        await updateTask(taskId, {
                            dueDate: datePart,
                            reminderTime: timePart,
                            title: updates.borrowerName ? `Follow up on debt: ${updates.borrowerName}` : undefined,
                            skipNotification: true
                        });

                        // Create Notification
                        if (user) {
                            await workflowService.createNotification({
                                user_id: user.id,
                                type: 'reminder',
                                content: `Debt Reminder Updated: ${updates.borrowerName || currentDebt.borrower_name}`,
                                data: { type: 'debt', id: id, path: '/debts' }
                            });
                        }
                    }
                } catch (e) {
                    console.error("Error syncing debt update to task", e);
                }
            }

            await loadDebts();
        }
    };

    const updateDebts = async (newDebtsState) => {
        setDebts(newDebtsState);
    };

    const moveDebt = async (debtId, newStatus) => {
        const { error } = await debtsService.moveDebt(debtId, newStatus);
        if (error) {
            console.error('Error moving debt:', error);
            setError(error.message);
        }
    };

    const deleteDebt = async (id) => {
        // Find current debt to check for related task
        let currentDebt = null;
        for (const key in debts) {
            const found = debts[key].items.find(d => d.id === id);
            if (found) {
                currentDebt = found;
                break;
            }
        }

        if (currentDebt && currentDebt.related_task_id) {
            await deleteTask(currentDebt.related_task_id);
        }

        const { error } = await debtsService.deleteDebt(id);
        if (error) {
            console.error('Error deleting debt:', error);
            setError(error.message);
        } else {
            await loadDebts();
        }
    };

    // --- Auth Functions ---
    const signIn = async (email, password) => {
        const { data, error } = await authService.signIn(email, password);
        if (error) {
            setError(error.message);
            return { error };
        }
        return { data, error: null };
    };

    const signUp = async (email, password, userData) => {
        const { data, error } = await authService.signUp(email, password, userData);
        if (error) {
            setError(error.message);
            return { error };
        }
        return { data, error: null };
    };

    const signOut = async () => {
        const { error } = await authService.signOut();
        if (error) {
            setError(error.message);
        }
    };

    return (
        <CRMContext.Provider value={{
            // Auth
            user,
            session,
            authLoading,
            signIn,
            signUp,
            signOut,
            uploadAvatar: authService.uploadAvatar,
            updateUser: async (updates) => {
                // Update Auth Metadata
                const { data: authData, error: authError } = await authService.updateUser(updates);
                if (authError) return { error: authError };

                // Update Public Profile
                if (user) {
                    await authService.updateUserProfile(user.id, updates);
                }

                // Update local state
                if (authData.user) {
                    setUser(authData.user);
                }

                return { data: authData, error: null };
            },

            // Loading & Error
            loading,
            error,
            setError,

            // Contacts
            contacts,
            addContact,
            updateContact,
            deleteContact,
            setContacts,

            // Deals
            deals,
            addDeal,
            updateDeal,
            updateDeals,
            moveDeal,
            deleteDeal,

            // Tasks
            tasks,
            addTask,
            toggleTask,
            updateTask,
            deleteTask,

            // Task Folders
            folders,
            addFolder,

            // Events
            events,
            addEvent,
            updateEvent,
            deleteEvent,
            setEvents,

            // Debts
            debts,
            addDebt,
            updateDebt,
            updateDebts,
            moveDebt,
            deleteDebt,
            setDebts
        }}>
            {children}
        </CRMContext.Provider>
    );
};
