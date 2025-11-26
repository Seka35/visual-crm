import React, { createContext, useContext, useState, useEffect } from 'react';
import * as workflowService from '../services/workflowService';
import { supabase } from '../lib/supabaseClient';

const WorkflowContext = createContext();

export const useWorkflow = () => {
    const context = useContext(WorkflowContext);
    if (!context) {
        throw new Error('useWorkflow must be used within a WorkflowProvider');
    }
    return context;
};

export const WorkflowProvider = ({ children }) => {
    const [workflows, setWorkflows] = useState([]);
    const [currentWorkflow, setCurrentWorkflow] = useState(null); // null = Personal
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load initial data
        loadWorkflows();
        loadNotifications();

        // Subscribe to notifications
        const channel = supabase
            .channel('public:notifications')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
                if (payload.new.user_id === supabase.auth.getUser()?.data?.user?.id) {
                    setNotifications(prev => [payload.new, ...prev]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const loadWorkflows = async () => {
        setLoading(true);
        const { data, error } = await workflowService.getWorkflows();
        if (!error) {
            setWorkflows(data);
        }
        setLoading(false);
    };

    const loadNotifications = async () => {
        const { data, error } = await workflowService.getNotifications();
        if (!error) {
            setNotifications(data);
        }
    };

    const createWorkflow = async (name, resources) => {
        const { data, error } = await workflowService.createWorkflow(name, resources);
        if (!error && data) {
            setWorkflows(prev => [...prev, data]);
            setCurrentWorkflow(data); // Switch to new workflow
            return data;
        }
        return null;
    };

    const joinWorkflow = async (code) => {
        const { data, error } = await workflowService.joinWorkflow(code);
        return { data, error };
    };

    const acceptJoinRequest = async (notification) => {
        const { membership_id } = notification.data;
        const { error } = await workflowService.updateMembershipStatus(membership_id, 'accepted');
        if (!error) {
            // Mark notification as read
            await workflowService.markNotificationRead(notification.id);
            loadNotifications();
        }
    };

    const switchWorkflow = (workflow) => {
        setCurrentWorkflow(workflow);
    };

    const deleteWorkflow = async (id) => {
        const { error } = await workflowService.deleteWorkflow(id);
        if (!error) {
            setWorkflows(prev => prev.filter(w => w.id !== id));
            if (currentWorkflow?.id === id) {
                setCurrentWorkflow(null);
            }
        }
        return { error };
    };

    const updateWorkflow = async (id, updates) => {
        const { data, error } = await workflowService.updateWorkflow(id, updates);
        if (!error && data) {
            setWorkflows(prev => prev.map(w => w.id === id ? data : w));
            if (currentWorkflow?.id === id) {
                setCurrentWorkflow(data);
            }
        }
        return { data, error };
    };

    return (
        <WorkflowContext.Provider value={{
            workflows,
            currentWorkflow,
            notifications,
            loading,
            createWorkflow,
            joinWorkflow,
            switchWorkflow,
            acceptJoinRequest,
            loadNotifications,
            deleteWorkflow,
            updateWorkflow // Expose updateWorkflow
        }}>
            {children}
        </WorkflowContext.Provider>
    );
};
