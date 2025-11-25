import React from 'react';
import { useWorkflow } from '../context/WorkflowContext';
import { Bell, Check, X, UserPlus } from 'lucide-react';

const NotificationCenter = ({ isOpen, onClose }) => {
    const { notifications, acceptJoinRequest } = useWorkflow();

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-100 mb-2 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800">Notifications</h3>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        {notifications.filter(n => !n.read).length} New
                    </span>
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
                                className={`p-3 rounded-xl transition-colors ${notification.read ? 'bg-white' : 'bg-slate-50'}`}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1">
                                        {notification.type === 'join_request' ? (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <UserPlus className="w-4 h-4" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Bell className="w-4 h-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700 leading-snug">{notification.content}</p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </p>

                                        {notification.type === 'join_request' && !notification.read && (
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => acceptJoinRequest(notification)}
                                                    className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Accept
                                                </button>
                                                <button className="flex-1 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
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
