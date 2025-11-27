import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import KanbanColumn from '../components/deals/KanbanColumn';
import DealCard from '../components/deals/DealCard';
import DealModal from '../components/deals/DealModal';
import { useCRM } from '../context/CRMContext';

const Deals = () => {
    const { deals: columns, updateDeals: setColumns, moveDeal, addDeal, updateDeal, deleteDeal } = useCRM();
    const [activeId, setActiveId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeal, setEditingDeal] = useState(null);

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
            const movedDeal = activeItems[activeIndex];
            if (movedDeal && overContainer) {
                moveDeal(movedDeal.id, overContainer);
            }

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
                        activeItems[activeIndex],
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

    const handleEditDeal = (deal) => {
        setEditingDeal(deal);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDeal(null);
    };

    return (
        <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-6xl font-bold font-gta text-slate-800 dark:text-white mb-4">BIG SCORES</h2>
                        <p className="text-slate-500 dark:text-slate-400">Plan the next big job.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Heist</span>
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
                <div className="flex-1 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full px-1">
                        {Object.values(columns).map((col) => (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                count={col.items.length}
                                total={col.items.reduce((acc, item) => acc + parseInt(item.amount.replace(/[^0-9]/g, '')), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                                color={col.color}
                                deals={col.items}
                                onDealClick={handleEditDeal}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? <DealCard deal={getActiveItem()} /> : null}
                </DragOverlay>
            </DndContext>

            <DealModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                initialData={editingDeal}
                onSubmit={async (dealData) => {
                    if (editingDeal) {
                        await updateDeal(editingDeal.id, dealData);
                    } else {
                        await addDeal(dealData);
                    }
                }}
                onDelete={deleteDeal}
            />
        </div>
    );
};

export default Deals;
