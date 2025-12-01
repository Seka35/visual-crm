import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import KanbanColumn from '../components/deals/KanbanColumn'; // Reusing KanbanColumn
import DebtCard from '../components/debts/DebtCard';
import DebtModal from '../components/debts/DebtModal';
import { useCRM } from '../context/CRMContext';

import { useSearchParams } from 'react-router-dom';

const Debts = () => {
    const { debts: columns, updateDebts: setColumns, moveDebt, addDebt, updateDebt, deleteDebt } = useCRM();
    const [activeId, setActiveId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    // Check for openId query param or create action
    React.useEffect(() => {
        const openId = searchParams.get('openId');
        const action = searchParams.get('action');

        if (openId) {
            // Find debt across all columns
            const allDebts = Object.values(columns).flatMap(col => col.items);
            const debtToOpen = allDebts.find(d => d.id === openId);

            if (debtToOpen) {
                handleEditDebt(debtToOpen);
                setSearchParams({}, { replace: true });
            }
        } else if (action === 'create_debt') {
            setIsModalOpen(true);
            setEditingDebt(null);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, columns, setSearchParams]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const findContainer = (id) => {
        if (id in columns) return id;
        return Object.keys(columns).find((key) =>
            columns[key].items.find((item) => item.id === id)
        );
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setColumns((prev) => {
            const activeItems = prev[activeContainer].items;
            const overItems = prev[overContainer].items;
            const activeIndex = activeItems.findIndex((item) => item.id === active.id);
            const overIndex = overItems.findIndex((item) => item.id === overId);

            let newIndex;
            if (overId in prev) {
                newIndex = overItems.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top > over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
            }

            // Persist the move to Supabase
            const movedDebt = activeItems[activeIndex];
            if (movedDebt && overContainer) {
                moveDebt(movedDebt.id, overContainer);
            }

            // Update the status of the moved item locally
            const updatedActiveItem = { ...activeItems[activeIndex], status: overContainer === 'lent' ? 'lent' : overContainer === 'partial' ? 'partial' : 'repaid' };

            return {
                ...prev,
                [activeContainer]: {
                    ...prev[activeContainer],
                    items: [
                        ...prev[activeContainer].items.filter((item) => item.id !== active.id),
                    ],
                },
                [overContainer]: {
                    ...prev[overContainer],
                    items: [
                        ...prev[overContainer].items.slice(0, newIndex),
                        updatedActiveItem,
                        ...prev[overContainer].items.slice(newIndex, prev[overContainer].items.length),
                    ],
                },
            };
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        const activeContainer = findContainer(active.id);
        const overContainer = findContainer(over?.id);

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            setActiveId(null);
            return;
        }

        const activeIndex = columns[activeContainer].items.findIndex(
            (item) => item.id === active.id
        );
        const overIndex = columns[overContainer].items.findIndex(
            (item) => item.id === over.id
        );

        if (activeIndex !== overIndex) {
            setColumns((prev) => {
                const newItems = [...prev[activeContainer].items];
                const [movedItem] = newItems.splice(activeIndex, 1);
                newItems.splice(overIndex, 0, movedItem);

                return {
                    ...prev,
                    [activeContainer]: {
                        ...prev[activeContainer],
                        items: newItems,
                    },
                };
            });
        }

        setActiveId(null);
    };

    const getActiveItem = () => {
        for (const key in columns) {
            const item = columns[key].items.find((i) => i.id === activeId);
            if (item) return item;
        }
        return null;
    };

    const handleEditDebt = (debt) => {
        setEditingDebt(debt);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDebt(null);
    };

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-6xl font-bold font-gta text-slate-800 dark:text-white mb-4">THE DEBTS</h2>
                        <p className="text-slate-500 dark:text-slate-400">Track who owes you money.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Debt</span>
                    </button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.values(columns).map((col) => (
                        <KanbanColumn
                            key={col.id}
                            id={col.id}
                            title={col.title}
                            count={col.items.length}
                            total={col.items.reduce((acc, item) => {
                                const amount = parseFloat(item.amount_lent.replace(/[^0-9.-]+/g, '') || 0);
                                return acc + amount;
                            }, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                            color={col.color}
                            deals={col.items}
                            onDealClick={handleEditDebt}
                            CardComponent={DebtCard}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeId ? <DebtCard debt={getActiveItem()} /> : null}
                </DragOverlay>
            </DndContext>

            <DebtModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                initialData={editingDebt}
                onSubmit={async (debtData) => {
                    if (editingDebt) {
                        await updateDebt(editingDebt.id, debtData);
                    } else {
                        await addDebt(debtData);
                    }
                }}
                onDelete={deleteDebt}
            />
        </div>
    );
};

export default Debts;
