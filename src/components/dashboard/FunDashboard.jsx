import React from 'react';
import { motion } from 'framer-motion';

const FunDashboard = () => {
    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            {/* Greeting */}
            <div className="bg-gradient-to-r from-yellow-300 to-orange-300 rounded-3xl p-8 shadow-xl border-4 border-white transform hover:scale-[1.02] transition-transform cursor-pointer">
                <h1 className="text-4xl font-black text-white drop-shadow-md mb-2">
                    Hi Captain Alex! 🚀
                </h1>
                <p className="text-white text-xl font-bold opacity-90">
                    Ready to blast off to success today?
                </p>
            </div>

            {/* Stats Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Money Piggy Bank */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="bg-pink-200 rounded-3xl p-6 border-4 border-white shadow-lg"
                >
                    <div className="text-6xl mb-4">🐷</div>
                    <h3 className="text-2xl font-black text-pink-600 mb-1">Piggy Bank</h3>
                    <p className="text-4xl font-black text-white drop-shadow-sm">$54,230</p>
                    <div className="mt-4 bg-white/50 rounded-full h-4 overflow-hidden">
                        <div className="bg-pink-500 h-full w-[75%]" />
                    </div>
                    <p className="text-pink-600 font-bold text-sm mt-2">Almost full!</p>
                </motion.div>

                {/* Deals Trophy */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="bg-yellow-200 rounded-3xl p-6 border-4 border-white shadow-lg"
                >
                    <div className="text-6xl mb-4">🏆</div>
                    <h3 className="text-2xl font-black text-yellow-600 mb-1">Wins</h3>
                    <p className="text-4xl font-black text-white drop-shadow-sm">12 Deals</p>
                    <div className="flex mt-4 gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="text-xl">⭐</div>
                        ))}
                    </div>
                    <p className="text-yellow-600 font-bold text-sm mt-2">You're a champion!</p>
                </motion.div>

                {/* Tasks Rocket */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="bg-primary/20 rounded-3xl p-6 border-4 border-white shadow-lg"
                >
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-2xl font-black text-primary mb-1">Missions</h3>
                    <p className="text-4xl font-black text-white drop-shadow-sm">8 Done</p>
                    <p className="text-primary font-bold text-lg mt-4">Zoom zoom!</p>
                </motion.div>

                {/* Happy Clients */}
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="bg-green-200 rounded-3xl p-6 border-4 border-white shadow-lg"
                >
                    <div className="text-6xl mb-4">😊</div>
                    <h3 className="text-2xl font-black text-green-600 mb-1">Friends</h3>
                    <p className="text-4xl font-black text-white drop-shadow-sm">98% Happy</p>
                    <div className="mt-4 flex -space-x-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full bg-white border-2 border-green-200 flex items-center justify-center text-xl">
                                {['🐶', '🐱', '🦊', '🐼'][i - 1]}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* The Race Track (Pipeline) */}
            <div className="bg-white rounded-3xl p-8 border-4 border-slate-100 shadow-xl relative overflow-hidden">
                <h2 className="text-3xl font-black text-slate-700 mb-8 flex items-center gap-3">
                    🏁 The Great Sales Race
                </h2>

                <div className="space-y-8 relative z-10">
                    {/* Lane 1 */}
                    <div className="relative">
                        <div className="flex justify-between text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs">
                            <span>Start</span>
                            <span>Finish Line</span>
                        </div>
                        <div className="h-12 bg-slate-100 rounded-full w-full relative overflow-hidden border-2 border-slate-200">
                            <div className="absolute top-0 bottom-0 left-0 w-[20%] bg-primary rounded-full opacity-30" />
                            <div className="absolute top-0 bottom-0 left-[20%] w-[20%] bg-indigo-400 rounded-full opacity-30" />
                            <div className="absolute top-0 bottom-0 left-[40%] w-[20%] bg-purple-400 rounded-full opacity-30" />
                            <div className="absolute top-0 bottom-0 left-[60%] w-[20%] bg-pink-400 rounded-full opacity-30" />

                            <motion.div
                                initial={{ left: '0%' }}
                                animate={{ left: '65%' }}
                                transition={{ duration: 2, type: "spring" }}
                                className="absolute top-1 w-10 h-10 text-3xl leading-none"
                            >
                                🏎️
                            </motion.div>
                        </div>
                        <p className="text-right font-bold text-slate-500 mt-1">Negotiation Stage</p>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-10 right-10 text-9xl opacity-5 rotate-12">🏁</div>
                <div className="absolute bottom-10 left-10 text-9xl opacity-5 -rotate-12">🏎️</div>
            </div>

            {/* Drawing Area Placeholder */}
            <div className="bg-indigo-50 rounded-3xl p-8 border-4 border-indigo-100 border-dashed text-center">
                <h2 className="text-2xl font-black text-indigo-400 mb-4">
                    🎨 Your Creative Corner
                </h2>
                <div className="h-48 bg-white rounded-2xl border-2 border-indigo-100 flex items-center justify-center">
                    <p className="text-indigo-300 font-bold text-lg">
                        (Imagine a drawing canvas here!)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FunDashboard;
