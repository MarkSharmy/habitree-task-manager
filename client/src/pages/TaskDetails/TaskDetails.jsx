import { useEffect, useState, useMemo, useRef } from 'react'; // Added useRef
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useSelector, useDispatch } from 'react-redux';
import { BarLoader } from 'react-spinners';
import { 
    fetchTaskById, 
    clearCurrentTask, 
    updateTaskAction, 
    deleteTask // Ensure this is exported from taskSlice
} from '../../store/slices/taskSlice';
import ScheduleTaskModal from '../../components/modals/Scheduler/SchedulerModal';
import { 
    Calendar, Settings, Info, ListTodo, 
    Trash2, PlayCircle, User, Tag, Folder, Edit3, MoreVertical 
} from 'lucide-react';
import './taskdetails.css';

const TaskDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate(); // For redirecting after delete
    
    const { currentTask: task, detailsLoading } = useSelector((state) => state.tasks);
    
    const [descInput, setDescInput] = useState("");
    const [newSubtask, setNewSubtask] = useState("");
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedItemForSchedule, setSelectedItemForSchedule] = useState(null);
    
    // Dropdown State
    const [showSettings, setShowSettings] = useState(false);
    const settingsRef = useRef(null);

    useEffect(() => {
        dispatch(fetchTaskById(id));
        return () => dispatch(clearCurrentTask());
    }, [dispatch, id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (task) setDescInput(task.description || "");
    }, [task]);

    const progressValue = useMemo(() => {
        if (!task?.subtasks || task.subtasks.length === 0) return 0;
        const completed = task.subtasks.filter(st => st.isCompleted).length;
        return Math.round((completed / task.subtasks.length) * 100);
    }, [task]);

    // Handlers
    const handleUpdate = (updates) => dispatch(updateTaskAction({ id, updates }));

    const handleDeleteTask = async () => {
        if (window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
            try {
                await dispatch(deleteTask(task._id)).unwrap();
                navigate('/tasks'); // Redirect to inventory
            } catch (err) {
                console.error("Failed to delete task:", err);
                alert("Error deleting task.");
            }
        }
    };

    const handleDeleteSubtask = (stId) => {
        if (window.confirm("Are you sure you want to remove this subtask?")) {
            const updatedSubtasks = task.subtasks.filter(st => st._id !== stId);
            handleUpdate({ subtasks: updatedSubtasks });
        }
    };

    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return;
        const updatedSubtasks = [...task.subtasks, { title: newSubtask, isCompleted: false }];
        handleUpdate({ subtasks: updatedSubtasks });
        setNewSubtask("");
    };

    const openScheduler = (item = task) => {
        const itemWithContext = item._id === task._id 
            ? item 
            : { ...item, parentId: task._id, category: task.category, groupId: task.groupId };

        setSelectedItemForSchedule(itemWithContext);
        setIsScheduleModalOpen(true);
    };

    if (detailsLoading || !task) return <div className="details-loader-container"><BarLoader color="#3b82f6" /><p>Syncing...</p></div>;
    
    return (
        <div className="task-details-container">
            <header className="task-header">
                <div className="task-title-area">
                    <div className={`category-icon-large ${task.category.toLowerCase()}`}>
                        <PlayCircle size={24} color="white" />
                    </div>
                    <h1>{task.title}</h1>
                </div>
                <div className="header-actions">
                    <button className="btn-add-schedule" onClick={() => openScheduler()}>
                        <Calendar size={18} /> Add to Schedule
                    </button>
                    
                    {/* Settings Dropdown */}
                    <div className="settings-menu-container" ref={settingsRef}>
                        <button 
                            className={`btn-icon-settings ${showSettings ? 'active' : ''}`}
                            onClick={() => setShowSettings(!showSettings)}
                        >
                            <Settings size={18} />
                        </button>
                        
                        {showSettings && (
                            <div className="settings-dropdown">
                                <button className="dropdown-item" onClick={() => {/* Add Edit Logic */}}>
                                    <Edit3 size={14} /> Edit Task
                                </button>
                                <button className="dropdown-item delete" onClick={handleDeleteTask}>
                                    <Trash2 size={14} /> Delete Task
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="task-content-grid">
                <section className="main-info-panel">
                    <div className="task-input-group">
                        <label>Description:</label>
                        <textarea 
                            value={descInput}
                            onChange={(e) => setDescInput(e.target.value)}
                            onBlur={() => handleUpdate({ description: descInput })}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate({ description: descInput })}
                            placeholder="Add a description..."
                        />
                    </div>

                    <div className="subtasks-section">
                        <label>Subtasks: {task.subtasks?.length || 0}</label>
                        <div className="subtasks-container">
                            {task.subtasks?.map((st, index) => (
                                <div key={st._id || index} className="detail-subtask-item">
                                    <div className="subtask-left">
                                        <ListTodo size={16} color="#94a3b8" />
                                        <input 
                                            className="subtask-edit-input"
                                            defaultValue={st.title}
                                            onBlur={(e) => {
                                                const updated = task.subtasks.map(s => s._id === st._id ? {...s, title: e.target.value} : s);
                                                handleUpdate({ subtasks: updated });
                                            }}
                                        />
                                    </div>
                                    <div className="subtask-right">
                                        <button className="btn-sub-action" onClick={() => openScheduler(st)}>
                                            <Calendar size={14} />
                                        </button>
                                        <Trash2 size={14} className="btn-sub-action delete" onClick={() => handleDeleteSubtask(st._id)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="add-subtask-footer">
                            <input 
                                type="text" 
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                placeholder="Add new subtask..." 
                            />
                            <button onClick={handleAddSubtask} className="btn-add-subtask">Add Subtask</button>
                        </div>
                    </div>
                </section>

                <aside className="metadata-sidebar">
                    {/* ... rest of your sidebar code ... */}
                    <div className="meta-list">
                        <div className="meta-item">
                            <div className="meta-label"><PlayCircle size={16}/> Status:</div>
                            <select 
                                className={`meta-select-badge ${task.status.replace(/\s+/g, '-').toLowerCase()}`}
                                value={task.status}
                                onChange={(e) => handleUpdate({ status: e.target.value })}
                            >
                                <option value="Not Started">Not Started</option>
                                <option value="On-Going">On-Going</option>
                                <option value="Completed">Completed</option>
                                <option value="Shelved">Shelved</option>
                            </select>
                        </div>
                        {/* ... other meta items ... */}
                    </div>

                    <div className="progress-card">
                        <label>Progress:</label>
                        <div className="circular-progress">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                <path 
                                    className="circle" 
                                    strokeDasharray={`${progressValue}, 100`} 
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                />
                                <text x="18" y="20.35" className="percentage">{progressValue}%</text>
                            </svg>
                        </div>
                    </div>
                </aside>
            </div>

            <ScheduleTaskModal 
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                task={selectedItemForSchedule}
            />
        </div>
    );
};

export default TaskDetails;