import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Bell, Check, X, UserPlus } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const NotificationCenter = ({ isOpen, onClose }) => {
    const { notifications, acceptJoinRequest, markAllNotificationsRead } = useWorkflow();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleNotificationClick = (notification) => {
        if (notification.data && notification.data.path) {
            // Navigate to resource with openId
            navigate(`${notification.data.path}?openId=${notification.data.id}`);
            onClose();
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 mb-2 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-white">Notifications</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            {notifications.filter(n => !n.read).length} New
                        </span>
                        {notifications.some(n => !n.read) && (
                            <button
                                onClick={markAllNotificationsRead}
                                className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-1">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-3 rounded-xl transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${notification.read ? 'bg-white dark:bg-slate-900 opacity-60' : 'bg-slate-50 dark:bg-slate-800'}`}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        {notification.type === 'join_request' ? (
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                <UserPlus className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.read ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-primary/10 text-primary'}`}>
                                                <Bell className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm leading-snug ${notification.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                                            {notification.content}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </p>

                                        {notification.type === 'join_request' && !notification.read && (
                                            <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => acceptJoinRequest(notification)}
                                                    className="flex-1 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Accept
                                                </button>
                                                <button className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1">
                                                    <X className="w-3 h-3" />
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationCenter;
