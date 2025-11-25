import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { signIn, signUp, error, setError } = useCRM();

    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUp(formData.email, formData.password, {
                    full_name: formData.fullName
                });

                if (error) {
                    setError(error.message);
                } else {
                    // Show success message
                    alert('Account created! Please check your email to verify your account.');
                    setIsSignUp(false);
                }
            } else {
                const { error } = await signIn(formData.email, formData.password);

                if (error) {
                    setError(error.message);
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4"
                    >
                        <span className="text-2xl font-bold text-white">CRM</span>
                    </motion.div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isSignUp ? 'Sign up to get started' : 'Sign in to continue'}
                    </p>
                </div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-xl"
                >
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required={isSignUp}
                                        className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                            {isSignUp && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Password must be at least 6 characters
                                </p>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setFormData({ email: '', password: '', fullName: '' });
                            }}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {isSignUp ? (
                                <>
                                    Already have an account?{' '}
                                    <span className="text-primary font-semibold">Sign In</span>
                                </>
                            ) : (
                                <>
                                    Don't have an account?{' '}
                                    <span className="text-primary font-semibold">Sign Up</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-8">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
