import React, { useState } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus, Filter, Search } from 'lucide-react';
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
        <div className="h-full md:h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Deals Pipeline</h2>
                    <p className="text-slate-500">Drag and drop deals to update their stage</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="flex gap-3 w-full sm:w-auto">
                        <div className="relative group flex-1 sm:flex-none">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search deals..."
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm w-full sm:w-64"
                            />
                        </div>
                        <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Deal</span>
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
                <div className="flex-1 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden pb-4">
                    <div className="flex flex-col md:flex-row gap-6 h-full md:min-w-fit px-1">
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
