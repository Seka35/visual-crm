import React, { createContext, useContext, useState, useEffect } from 'react';
import * as contactsService from '../services/contactsService';
import * as dealsService from '../services/dealsService';
import * as tasksService from '../services/tasksService';
import * as eventsService from '../services/eventsService';

import * as debtsService from '../services/debtsService';
import * as authService from '../services/authService';
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
                setTasks([]);
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
            loadTasks(),
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
            setError(error.message);
            return null;
        } else {
            setTasks(prev => [data, ...prev]);
            await loadContacts();
            return data;
        }
    };

    const toggleTask = async (id) => {
        const { data, error } = await tasksService.toggleTask(id);
        if (error) {
            console.error('Error toggling task:', error);
            setError(error.message);
        } else {
            setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        }
    };

    const updateTask = async (id, updates) => {
        const { data, error } = await tasksService.updateTask(id, updates);
        if (error) {
            console.error('Error updating task:', error);
            setError(error.message);
        } else {
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
                        priority: 'high'
                    };

                    const { data: taskDataResponse, error: taskError } = await addTask(taskData);

                    if (taskDataResponse && !taskError) {
                        await dealsService.updateDeal(data.id, { related_task_id: taskDataResponse.id });
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
                            priority: 'high'
                        };
                        const { data: taskRes } = await addTask(taskData);
                        if (taskRes) {
                            await dealsService.updateDeal(id, { related_task_id: taskRes.id });
                        }
                    } else if (!hasReminder && hadReminder) {
                        // Removed reminder -> Delete task
                        if (taskId) {
                            await deleteTask(taskId);
                            await dealsService.updateDeal(id, { related_task_id: null });
                        }
                    } else if (hasReminder && taskId) {
                        // Updated reminder -> Update task
                        // Check if relevant fields changed
                        if (updates.reminder_date || updates.reminder_time || updates.title) {
                            await updateTask(taskId, {
                                dueDate: newDate,
                                reminderTime: newTime,
                                title: updates.title ? `Follow up on deal: ${updates.title}` : undefined
                            });
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
        const { data, error } = await debtsService.addDebt(debt, currentWorkflowId);
        if (error) {
            console.error('Error adding debt:', error);
            setError(error.message);
            return null;
        } else {
            await loadDebts();
            return data;
        }
    };

    const updateDebt = async (id, updates) => {
        const { data, error } = await debtsService.updateDebt(id, updates);
        if (error) {
            console.error('Error updating debt:', error);
            setError(error.message);
        } else {
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
            setTasks,

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
