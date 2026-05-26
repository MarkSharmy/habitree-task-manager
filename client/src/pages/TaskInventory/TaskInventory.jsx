import { useState, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarLoader } from 'react-spinners';
import InventoryCard from '../../components/task/InventoryCard/InventoryCard';
import CreateTaskModal from '../../components/modals/Task/CreateTaskModal';

import { createNewTask, fetchInventoryTasks } from '../../store/slices/taskSlice';
import './taskInventory.css';

/* ── Scrollable group row with left/right nav buttons ── */
const GroupRow = ({ group, onTaskClick, onNewTask }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft]   = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', checkScroll, { passive: true });
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);
        return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
    }, [group.tasks]);

    const scroll = (dir) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 220, behavior: 'smooth' });
    };

    return (
        <section className="group-section">
            <div className="group-title">
                <span className="accent-bar" style={{ backgroundColor: group.color }} />
                <h2>{group.name}</h2>
                <span className="count-badge">{group.tasks.length} TASKS</span>

                {/* Scroll controls — only shown when content overflows */}
                <div className="group-scroll-controls">
                    <button
                        className={`group-scroll-btn ${!canScrollLeft ? 'disabled' : ''}`}
                        onClick={() => scroll(-1)}
                        disabled={!canScrollLeft}
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <button
                        className={`group-scroll-btn ${!canScrollRight ? 'disabled' : ''}`}
                        onClick={() => scroll(1)}
                        disabled={!canScrollRight}
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div className="tasks-grid" ref={scrollRef}>
                {group.tasks.map(task => (
                    <div
                        key={task._id}
                        onClick={() => onTaskClick(task._id)}
                        className="card-clickable-wrapper"
                    >
                        <InventoryCard
                            title={task.title}
                            category={task.category}
                            subtasks={task.subtasks || []}
                            status={task.status}
                            date={task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Unscheduled'}
                            groupColor={group.color}
                        />
                    </div>
                ))}
                <div className="new-task-placeholder" onClick={onNewTask}>
                    <Plus size={24} />
                    <span>NEW TASK</span>
                </div>
            </div>
        </section>
    );
};

const TaskInventory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize navigation
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { inventory, loading } = useSelector((state) => state.tasks);

    useEffect(() => {
        dispatch(fetchInventoryTasks());
    }, [dispatch]);

    const handleCreateTask = async (taskData) => {
        const payload = {
            title: taskData.taskTitle,
            groupId: taskData.selectedGroupId,
            category: taskData.category,
            subtasks: taskData.subtasks.map(st => ({ title: st }))
        };

        await dispatch(createNewTask(payload)).unwrap(); 
        setIsModalOpen(false);
        dispatch(fetchInventoryTasks()); 
    };

    const filteredGroups = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        const groupEntries = Object.entries(inventory)
            .filter(([_, tasks]) => tasks.length > 0)
            .map(([groupName, tasks]) => {
                const groupMeta = tasks[0]?.groupId;
                // Latest updatedAt (or createdAt fallback) across all tasks in the group
                const lastUpdated = tasks.reduce((latest, task) => {
                    const ts = new Date(task.updatedAt || task.createdAt || 0).getTime();
                    return ts > latest ? ts : latest;
                }, 0);
                return {
                    name: groupName,
                    color: groupMeta?.color || '#64748b',
                    tasks,
                    lastUpdated,
                };
            })
            // Most recently updated group first
            .sort((a, b) => b.lastUpdated - a.lastUpdated);

        if (!query) return groupEntries;

        return groupEntries.map(group => {
            const matchingTasks = group.tasks.filter(task =>
                task.title.toLowerCase().includes(query) ||
                task.category.toLowerCase().includes(query)
            );
            return { ...group, tasks: matchingTasks };
        }).filter(group => group.tasks.length > 0);
    }, [searchQuery, inventory]);

    if (loading && Object.keys(inventory).length === 0) {
        return (
            <div className="details-loader-container">
                <BarLoader color="#3b82f6" />
                <p>Syncing Data...</p>
            </div>
        );
    }

    return (
        <div className="inventory-container">
            <header className="inventory-header">
                <div className="header-left">
                    <h1>Task Inventory</h1>
                    <p>Manage and organise your tasks and goals</p>
                </div>
                <button className="create-task-btn" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} /> Create Task
                </button>
            </header>

            <div className="inventory-controls">
                <div className="filter-buttons">
                    <button className="filter-btn active"><Filter size={16} /> By Group</button>
                    <button className="filter-btn"><Filter size={16} /> By Category</button>
                </div>
                <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input 
                        type="text"
                        placeholder="Quick search across all tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="inventory-content">
                {filteredGroups.length > 0 ? (
                    filteredGroups.map((group) => (
                        <GroupRow
                            key={group.name}
                            group={group}
                            onTaskClick={(id) => navigate(`/tasks/${id}`)}
                            onNewTask={() => setIsModalOpen(true)}
                        />
                    ))
                ) : (
                    <div className="no-results">
                        {searchQuery ? <p>No tasks match "<strong>{searchQuery}</strong>"</p> : <p>Your inventory is empty.</p>}
                    </div>
                )}
            </div>
            
            <CreateTaskModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateTask}
            />
        </div>
    );
};

export default TaskInventory;