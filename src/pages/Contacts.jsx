import React, { useState } from 'react';
import { LayoutGrid, List, Plus } from 'lucide-react';
import ContactCard from '../components/contacts/ContactCard';
import ContactList from '../components/contacts/ContactList';
import ContactModal from '../components/contacts/ContactModal';
import { useCRM } from '../context/CRMContext';

import { useSearchParams } from 'react-router-dom';

const Contacts = () => {
    const { contacts, addContact, updateContact, deleteContact } = useCRM();
    const [viewMode, setViewMode] = useState('grid');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // Check for openId query param or create action
    React.useEffect(() => {
        const openId = searchParams.get('openId');
        const action = searchParams.get('action');

        if (openId && contacts.length > 0) {
            const contactToOpen = contacts.find(c => c.id === openId);
            if (contactToOpen) {
                handleEditContact(contactToOpen);
                // Clear param
                setSearchParams({}, { replace: true });
            }
        } else if (action === 'create_contact') {
            setIsModalOpen(true);
            setEditingContact(null);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, contacts, setSearchParams]);

    const handleEditContact = (contact) => {
        setEditingContact(contact);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingContact(null);
    };

    const handleSaveContact = async (contactData) => {
        if (editingContact) {
            await updateContact(editingContact.id, contactData);
        } else {
            await addContact(contactData);
        }
        handleCloseModal();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-6xl font-bold font-gta text-slate-800 dark:text-white mb-4">THE CREW</h2>
                    <p className="text-slate-500 dark:text-slate-400">Keep your friends close and your enemies closer.</p>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Associate</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {contacts.map(contact => (
                        <div key={contact.id} onClick={() => handleEditContact(contact)} className="cursor-pointer">
                            <ContactCard contact={contact} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <ContactList contacts={contacts} onContactClick={handleEditContact} />
                </div>
            )}

            <ContactModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                initialData={editingContact}
                onSubmit={handleSaveContact}
                onDelete={deleteContact}
            />
        </div>
    );
};

export default Contacts;
