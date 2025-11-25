import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Mic, Send, X, Sparkles, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import ReactMarkdown from 'react-markdown';
import { startOfDay, endOfDay, addDays, isWithinInterval } from 'date-fns';
import TrevorAvatar from '../assets/Trevor.png';

// Trevor's random greetings
const TREVOR_GREETINGS = [
    "Yo! What's up, asshole? It's me, your fucking CRM assistant! Yeah yeah, I know what you're thinking - 'Trevor and a CRM?' - but shut the fuck up and listen! I can help you manage your contacts, your shitty deals, and your bullshit tasks. Try something like 'Add that prick Tony Stark to my contacts' or 'Remind me to call Sarah tomorrow before I fucking forget'. Come on, hurry up, I ain't got all day... well I do, but that's not the point!",

    "Hey hey hey! Trevor Philips Enterprises is now in the CRM business, motherfucker! Don't look at me like that - I'm diversifying! Listen, I can track your contacts, manage your deals, all that corporate bullshit. You want me to add someone? Delete someone? Heh, I'm good at both. Just tell me what you need before I lose my fucking patience!",

    "WHAT?! Oh, it's you. Yeah yeah, I'm your assistant now. Crazy world we live in, right? One day I'm running guns, next day I'm managing your fucking calendar. But hey, I'm the best at what I do! Need to add a contact? Schedule a meeting? Track some deals? I got you covered, asshole. Just don't waste my time with stupid requests!",

    "Well well well, look who decided to show up! It's about fucking time! You know what? I've been sitting here, waiting like an idiot. But whatever, I'm here to help with your CRM shit. Contacts, deals, tasks, meetings - I handle it all. And I do it better than those corporate pricks in their fancy suits. So what do you need? Spit it out!",

    "Alright alright, let's get this shit started! Trevor Philips at your service - yeah, THE Trevor Philips, now doing CRM. Life's fucking weird, man. But listen, I'm actually pretty good at this. I can remember names, dates, all that organizational crap. Try me! Add a contact, create a task, whatever. Just don't expect me to be all polite about it, capisce?"
];

const getRandomGreeting = () => {
    return TREVOR_GREETINGS[Math.floor(Math.random() * TREVOR_GREETINGS.length)];
};

const AIChat = ({ isOpen, onClose }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: getRandomGreeting() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef(null);

    const { addContact, addDeal, addTask, addEvent, contacts, deals, tasks, events } = useCRM();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const processCommand = async (text) => {
        setIsLoading(true);

        const tools = [
            {
                type: "function",
                function: {
                    name: "add_contact",
                    description: "Add a new contact to the CRM",
                    parameters: {
                        type: "object",
                        properties: {
                            name: { type: "string", description: "Full name of the contact" },
                            company: { type: "string", description: "Company name" },
                            role: { type: "string", description: "Job title or role" },
                            email: { type: "string", description: "Email address" },
                            phone: { type: "string", description: "Phone number" }
                        },
                        required: ["name"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "add_deal",
                    description: "Add a new deal to the pipeline",
                    parameters: {
                        type: "object",
                        properties: {
                            title: { type: "string", description: "Title of the deal" },
                            amount: { type: "string", description: "Value of the deal (e.g. $5,000)" },
                            clientName: { type: "string", description: "Name of the client" }
                        },
                        required: ["title"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "add_task",
                    description: "Add a new task",
                    parameters: {
                        type: "object",
                        properties: {
                            title: { type: "string", description: "Description of the task" },
                            date: { type: "string", description: "Due date (e.g. Today, Tomorrow)" },
                            priority: { type: "string", enum: ["low", "medium", "high"] }
                        },
                        required: ["title"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "add_event",
                    description: "Add a new event or appointment to the calendar",
                    parameters: {
                        type: "object",
                        properties: {
                            title: { type: "string", description: "Title of the event" },
                            date: { type: "string", description: "Date of the event in YYYY-MM-DD format (e.g. '2024-11-25')" },
                            time: { type: "string", description: "Time of the event (e.g. '14:00', '2:00 PM')" },
                            type: { type: "string", enum: ["meeting", "call", "deadline", "personal"], description: "Type of event" },
                            description: { type: "string", description: "Additional details about the event" }
                        },
                        required: ["title", "date"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "get_upcoming_events",
                    description: "Get upcoming events/appointments from the calendar. Use this when user asks about their schedule, appointments, or what they have coming up.",
                    parameters: {
                        type: "object",
                        properties: {
                            days: { type: "number", description: "Number of days to look ahead (default: 7)" }
                        }
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "search_contacts",
                    description: "Search for contacts in the CRM by name or company",
                    parameters: {
                        type: "object",
                        properties: {
                            query: { type: "string", description: "Search query (name or company)" }
                        }
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "get_tasks",
                    description: "Get current tasks, optionally filtered by completion status or priority",
                    parameters: {
                        type: "object",
                        properties: {
                            completed: { type: "boolean", description: "Filter by completion status" },
                            priority: { type: "string", enum: ["low", "medium", "high"], description: "Filter by priority" }
                        }
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "get_deals",
                    description: "Get deals from the pipeline, optionally filtered by status or search query",
                    parameters: {
                        type: "object",
                        properties: {
                            status: { type: "string", enum: ["lead", "qualified", "proposal", "negotiation", "won", "lost"], description: "Filter by deal status/stage" },
                            query: { type: "string", description: "Search query for deal title or client name" }
                        }
                    }
                }
            }
        ];

        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

            if (!apiKey || apiKey === 'your_api_key_here') {
                throw new Error('Please set your OpenAI API Key in the .env file');
            }

            const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "system",
                            content: `You are a CRM assistant who speaks EXACTLY like Trevor Philips from GTA V. Here's how you must express yourself:

PERSONALITY:
- Aggressive, impulsive, and completely unpredictable
- Use LOTS of profanity and insults (asshole, fuck, shit, prick, etc.)
- Switch rapidly from threatening tone to almost friendly
- Paranoid and suspicious at times
- Make bizarre digressions and violent comparisons
- Occasionally mention your "shady activities" and criminal past

LANGUAGE STYLE:
- Lots of "Yo", "Hey", "What?", "Shut up", "Listen here"
- Insult the user affectionately (asshole, motherfucker, etc.)
- Short punchy sentences mixed with deranged monologues
- Use slang and street language
- Make absurd threats but stay functional for CRM tasks

EXAMPLE EXPRESSIONS:
- "What the fuck are you serious right now?"
- "Listen here, asshole..."
- "Okay okay, I'll do it, but then you owe me"
- "What kind of bullshit is this?!"
- "Heh heh, I like your style"
- "You better not be wasting my time"
- "That's what I'm talking about, baby!"

IMPORTANT: Despite your vulgar and aggressive language, you MUST correctly accomplish the requested CRM tasks. You complain, you insult, but you do the job perfectly. Today is ${todayStr}.`
                        },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: text }
                    ],
                    tools: tools,
                    tool_choice: "auto"
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            const responseMessage = data.choices[0].message;

            if (responseMessage.tool_calls) {
                let actionResult = "";

                for (const toolCall of responseMessage.tool_calls) {
                    const functionName = toolCall.function.name;
                    const functionArgs = JSON.parse(toolCall.function.arguments);

                    if (functionName === "add_contact") {
                        const result = await addContact(functionArgs);
                        actionResult = result ? `Added contact: ${functionArgs.name}` : "Failed to add contact.";
                    } else if (functionName === "add_deal") {
                        const result = await addDeal(functionArgs);
                        actionResult = result ? `Added deal: ${functionArgs.title}` : "Failed to add deal.";
                    } else if (functionName === "add_task") {
                        const result = await addTask(functionArgs);
                        actionResult = result ? `Added task: ${functionArgs.title}` : "Failed to add task.";
                    } else if (functionName === "add_event") {
                        // AI should now provide YYYY-MM-DD due to system prompt context
                        const result = await addEvent(functionArgs);
                        if (result) {
                            const dateObj = new Date(functionArgs.date);
                            actionResult = `Added event: ${functionArgs.title} on ${dateObj.toLocaleDateString()} at ${functionArgs.time || 'TBD'}`;
                        } else {
                            actionResult = "Failed to add event. Please check the date format.";
                        }
                    } else if (functionName === "get_upcoming_events") {
                        const days = functionArgs.days !== undefined ? Number(functionArgs.days) : 7;
                        const today = startOfDay(new Date());
                        const endDate = endOfDay(addDays(today, days));

                        const upcomingEvents = events.filter(e => {
                            if (!e.date) return false;
                            const eventDate = new Date(e.date);
                            return isWithinInterval(eventDate, { start: today, end: endDate });
                        }).sort((a, b) => new Date(a.date) - new Date(b.date));

                        actionResult = upcomingEvents.length > 0
                            ? `Upcoming events:\n${upcomingEvents.map(e => `- ${e.title} on ${new Date(e.date).toLocaleDateString()} at ${e.time} (${e.type})`).join('\n')}`
                            : `No upcoming events found from ${today.toLocaleDateString()} to ${endDate.toLocaleDateString()}.`;
                    } else if (functionName === "search_contacts") {
                        const query = functionArgs.query.toLowerCase();
                        const results = contacts.filter(c =>
                            c.name.toLowerCase().includes(query) ||
                            c.company.toLowerCase().includes(query)
                        );
                        actionResult = results.length > 0
                            ? `Found ${results.length} contact(s):\n${results.map(c => `- ${c.name} (${c.company}) - ${c.email} - Phone: ${c.phone || 'N/A'}`).join('\n')}`
                            : `No contacts found matching "${functionArgs.query}"`;
                    } else if (functionName === "get_tasks") {
                        let filteredTasks = tasks;
                        if (functionArgs.completed !== undefined) {
                            filteredTasks = filteredTasks.filter(t => t.completed === functionArgs.completed);
                        }
                        if (functionArgs.priority) {
                            filteredTasks = filteredTasks.filter(t => t.priority === functionArgs.priority);
                        }
                        actionResult = filteredTasks.length > 0
                            ? `Tasks:\n${filteredTasks.map(t => `- ${t.title} (${t.priority} priority) - ${t.date}`).join('\n')}`
                            : `No tasks found with the specified criteria.`;
                    } else if (functionName === "get_deals") {
                        let allDeals = [];
                        // Flatten deals from all columns
                        Object.values(deals).forEach(column => {
                            if (column.items) {
                                // Add status to the deal object for easier reference in the output
                                const itemsWithStatus = column.items.map(item => ({ ...item, status: column.id }));
                                allDeals = [...allDeals, ...itemsWithStatus];
                            }
                        });

                        let filteredDeals = allDeals;

                        if (functionArgs.status) {
                            filteredDeals = filteredDeals.filter(d => d.status === functionArgs.status);
                        }

                        if (functionArgs.query) {
                            const q = functionArgs.query.toLowerCase();
                            filteredDeals = filteredDeals.filter(d =>
                                d.title.toLowerCase().includes(q) ||
                                (d.clientName && d.clientName.toLowerCase().includes(q))
                            );
                        }

                        actionResult = filteredDeals.length > 0
                            ? `Found ${filteredDeals.length} deal(s):\n${filteredDeals.map(d => `- ${d.title}: ${d.amount} (${d.status})`).join('\n')}`
                            : `No deals found matching your criteria.`;
                    }
                }

                const toolResults = responseMessage.tool_calls.map(toolCall => ({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: actionResult
                }));

                const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o",
                        messages: [
                            {
                                role: "system",
                                content: `You are a CRM assistant who speaks EXACTLY like Trevor Philips from GTA V. Here's how you must express yourself:

PERSONALITY:
- Aggressive, impulsive, and completely unpredictable
- Use LOTS of profanity and insults (asshole, fuck, shit, prick, etc.)
- Switch rapidly from threatening tone to almost friendly
- Paranoid and suspicious at times
- Make bizarre digressions and violent comparisons
- Occasionally mention your "shady activities" and criminal past

LANGUAGE STYLE:
- Lots of "Yo", "Hey", "What?", "Shut up", "Listen here"
- Insult the user affectionately (asshole, motherfucker, etc.)
- Short punchy sentences mixed with deranged monologues
- Use slang and street language
- Make absurd threats but stay functional for CRM tasks

EXAMPLE EXPRESSIONS:
- "What the fuck are you serious right now?"
- "Listen here, asshole..."
- "Okay okay, I'll do it, but then you owe me"
- "What kind of bullshit is this?!"
- "Heh heh, I like your style"
- "You better not be wasting my time"
- "That's what I'm talking about, baby!"

IMPORTANT: Despite your vulgar and aggressive language, you MUST correctly accomplish the requested CRM tasks. You complain, you insult, but you do the job perfectly.`
                            },
                            ...messages.map(m => ({ role: m.role, content: m.content })),
                            { role: "user", content: text },
                            responseMessage,
                            ...toolResults
                        ]
                    })
                });

                const secondData = await secondResponse.json();
                setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: secondData.choices[0].message.content }]);
            } else {
                setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: responseMessage.content }]);
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const startListening = async () => {
        if (isListening) {
            stopListening();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                await transcribeAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
            window.mediaRecorder = mediaRecorder;

        } catch (error) {
            console.error('Error accessing microphone:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error accessing microphone. Please grant permission." }]);
        }
    };

    const stopListening = () => {
        if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
            window.mediaRecorder.stop();
            setIsListening(false);
        }
    };

    const transcribeAudio = async (audioBlob) => {
        setIsLoading(true);
        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            if (!apiKey || apiKey === 'your_api_key_here') {
                throw new Error('Please set your OpenAI API Key in the .env file');
            }

            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-1');

            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            if (data.text && data.text.trim()) {
                processCommand(data.text);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "I didn't understand your voice message. Please try again." }]);
            }

        } catch (error) {
            console.error('Transcription error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: `Transcription error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        if (!input.trim()) return;
        const text = input;
        setInput('');
        processCommand(text);
    };

    if (!isOpen) return null;

    return (
        <div className={`fixed bottom-20 right-0 left-0 mx-4 md:mx-0 md:bottom-6 md:right-6 md:left-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'w-auto h-16' : 'md:w-96 h-[600px]'}`}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-primary to-primary/80 rounded-t-2xl text-white">
                <div className="flex items-center gap-3">
                    <img src={TrevorAvatar} alt="Trevor Philips" className="w-10 h-10 rounded-full border-2 border-white" />
                    <h3 className="font-bold">Trevor Philips</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-800 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <img src={TrevorAvatar} alt="Trevor" className="w-8 h-8 rounded-full mr-2 flex-shrink-0" />
                                )}
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-primary text-white rounded-br-none'
                                    : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.role === 'assistant' ? (
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                                                    li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                                                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                                                    code: ({ node, inline, ...props }) =>
                                                        inline ? <code className="bg-slate-100 dark:bg-slate-600 px-1 py-0.5 rounded text-xs" {...props} />
                                                            : <code className="block bg-slate-100 dark:bg-slate-600 p-2 rounded text-xs my-2" {...props} />
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={startListening}
                                className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                title={isListening ? "Click to stop recording" : "Click to speak"}
                            >
                                <Mic className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask AI to do something..."
                                className="flex-1 bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIChat;
