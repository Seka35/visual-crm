import { supabase } from '../lib/supabaseClient';

/**
 * Authentication Service
 * Handles user authentication with Supabase Auth
 */

// Sign up a new user
export const signUp = async (email, password, userData = {}) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: userData.full_name || '',
                    avatar_url: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
                }
            }
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error signing up:', error);
        return { data: null, error };
    }
};

// Sign in an existing user
export const signIn = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error signing in:', error);
        return { data: null, error };
    }
};

// Sign out the current user
export const signOut = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error signing out:', error);
        return { error };
    }
};

// Get the current user
export const getCurrentUser = async () => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return { user, error: null };
    } catch (error) {
        console.error('Error getting current user:', error);
        return { user: null, error };
    }
};

// Get the current session
export const getSession = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return { session, error: null };
    } catch (error) {
        console.error('Error getting session:', error);
        return { session: null, error };
    }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
};

// Get user profile from public.users table
export const getUserProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error getting user profile:', error);
        return { data: null, error };
    }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return { data: null, error };
    }
};

// Update user metadata (Auth)
export const updateUser = async (updates) => {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating user metadata:', error);
        return { data: null, error };
    }
};

// Upload avatar to storage
export const uploadAvatar = async (file, userId) => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('AVATAR')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('AVATAR')
            .getPublicUrl(filePath);

        return { publicUrl, error: null };
    } catch (error) {
        console.error('Error uploading avatar:', error);
        return { publicUrl: null, error };
    }
};

// Ensure user profile exists in public.users
export const ensureUserProfile = async (user) => {
    if (!user) return;

    try {
        // Check if profile exists
        const { data: profile, error: fetchError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();

        if (profile) return; // Profile exists

        // If not found (or error), try to create it
        console.log('User profile missing, creating one...');

        const { error: insertError } = await supabase
            .from('users')
            .insert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url || ''
            }]);

        if (insertError) {
            console.error('Error creating user profile:', insertError);
            throw insertError;
        }

        console.log('User profile created successfully');
    } catch (error) {
        console.error('Error ensuring user profile:', error);
    }
};
