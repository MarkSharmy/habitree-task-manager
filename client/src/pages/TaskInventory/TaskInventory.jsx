import { useState, useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Plus, Filter } from 'lucide-react';

import InventoryCard from '../../components/task/InventoryCard/InventoryCard';
import { fetchInventoryTasks } from '../../store/slices/taskSlice';
import './taskInventory.css';

const TaskInventory = () => {
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    
    const { inventory, loading } = useSelector((state) => state.tasks);

    useEffect(() => {
        dispatch(fetchInventoryTasks());
    }, [dispatch]);

    const filteredGroups = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        
        // Transform the object into a renderable array
        const groupEntries = Object.entries(inventory)
            .filter(([_, tasks]) => tasks.length > 0) // Hide empty groups (like Uncategorized)
            .map(([groupName, tasks]) => {
                // Get group metadata from the first task's populated groupId
                const groupMeta = tasks[0]?.groupId;
                
                return {
                    name: groupName,
                    color: groupMeta?.color || '#64748b', // Fallback color
                    tasks: tasks
                };
            });

        if (!query) return groupEntries;

        // Perform the deep filter
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
            <div className="inventory-loader-container">
                <div className="loader-spinner"></div>
                <p>Syncing your tasks...</p>
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
                <button className="create-task-btn">
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
                        <section key={group.name} className="group-section">
                            <div className="group-title">
                                <span 
                                    className="accent-bar" 
                                    style={{ backgroundColor: group.color }}
                                ></span>
                                <h2>{group.name}</h2>
                                <span className="count-badge">{group.tasks.length} TASKS</span>
                            </div>
                            
                            <div className="tasks-grid">
                                {group.tasks.map(task => (
                                    <InventoryCard 
                                        key={task._id}
                                        title={task.title}
                                        category={task.category}
                                        progress={task.progress || 0}
                                        date={task.scheduledDate ? new Date(task.scheduledDate).toLocaleDateString() : 'Unscheduled'}
                                        status={task.status}
                                        groupColor={group.color}
                                    />
                                ))}
                                
                                <div className="new-task-placeholder">
                                    <Plus size={24} />
                                    <span>NEW TASK</span>
                                </div>
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="no-results">
                        {searchQuery ? (
                            <p>No tasks match "<strong>{searchQuery}</strong>"</p>
                        ) : (
                            <div className="empty-inventory-state">
                                <p>Your inventory is empty.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskInventory;