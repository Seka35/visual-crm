import { supabase } from '../lib/supabaseClient';

export const getWorkflows = async () => {
    const { data, error } = await supabase
        .from('workflows')
        .select('*');
    return { data, error };
};

export const createWorkflow = async (name, sharedResources) => {
    // Generate a simple 6-character code
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data, error } = await supabase
        .from('workflows')
        .insert([{
            name,
            shared_resources: sharedResources,
            share_code: shareCode,
            creator_id: (await supabase.auth.getUser()).data.user.id
        }])
        .select()
        .single();

    if (data) {
        // Manually add creator as admin member (Trigger removed due to 500 error)
        await supabase
            .from('workflow_members')
            .insert([{
                workflow_id: data.id,
                user_id: data.creator_id,
                role: 'admin',
                status: 'accepted'
            }]);
    }

    return { data, error };
};

export const joinWorkflow = async (shareCode) => {
    // Find workflow by code using secure RPC function (bypasses RLS)
    const { data: workflow, error: findError } = await supabase
        .rpc('find_workflow_by_code', { code: shareCode })
        .single();

    if (findError || !workflow) return { error: { message: 'Invalid share code' } };

    const user = (await supabase.auth.getUser()).data.user;

    // Check if already a member
    const { data: existingMember } = await supabase
        .from('workflow_members')
        .select('*')
        .eq('workflow_id', workflow.id)
        .eq('user_id', user.id)
        .single();

    if (existingMember) return { error: { message: 'Already a member of this workflow' } };

    // Create membership request
    const { data, error } = await supabase
        .from('workflow_members')
        .insert([{
            workflow_id: workflow.id,
            user_id: user.id,
            role: 'member',
            status: 'pending'
        }])
        .select()
        .single();

    if (data) {
        // Create notification for creator
        await supabase
            .from('notifications')
            .insert([{
                user_id: workflow.creator_id,
                type: 'join_request',
                content: `User ${user.email} wants to join your workflow.`,
                data: { workflow_id: workflow.id, requester_id: user.id, membership_id: data.id }
            }]);
    }

    return { data, error };
};

export const getWorkflowMembers = async (workflowId) => {
    const { data, error } = await supabase
        .from('workflow_members')
        .select(`
            *,
            users (
                id,
                email,
                full_name,
                avatar_url
            )
        `)
        .eq('workflow_id', workflowId);
    return { data, error };
};

export const updateMembershipStatus = async (membershipId, status) => {
    const { data, error } = await supabase
        .from('workflow_members')
        .update({ status })
        .eq('id', membershipId)
        .select()
        .single();

    if (data && status === 'accepted') {
        // Notify the user
        await supabase
            .from('notifications')
            .insert([{
                user_id: data.user_id,
                type: 'join_accepted',
                content: `Your request to join workflow has been accepted.`,
                data: { workflow_id: data.workflow_id }
            }]);
    }

    return { data, error };
};

export const deleteWorkflowMember = async (membershipId) => {
    const { error } = await supabase
        .from('workflow_members')
        .delete()
        .eq('id', membershipId);
    return { error };
};

export const deleteWorkflow = async (workflowId) => {
    const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);
    return { error };
};

export const getNotifications = async () => {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
    return { data, error };
};

export const markNotificationRead = async (id) => {
    const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
    return { data, error };
};

export const updateWorkflow = async (id, updates) => {
    const { data, error } = await supabase
        .from('workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
};
