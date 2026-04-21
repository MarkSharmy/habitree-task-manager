import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BarLoader } from 'react-spinners';
import { fetchTaskById, clearCurrentTask, updateTaskAction } from '../../store/slices/taskSlice';
import { 
    Calendar, Settings, Info, ListTodo, 
    Trash2, PlayCircle, User, Tag, Folder, CheckCircle
} from 'lucide-react';
import './taskdetails.css';

const TaskDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentTask: task, detailsLoading } = useSelector((state) => state.tasks);
    
    const [descInput, setDescInput] = useState("");
    const [newSubtask, setNewSubtask] = useState("");

    useEffect(() => {
        dispatch(fetchTaskById(id));
        return () => dispatch(clearCurrentTask());
    }, [dispatch, id]);

    // Sync local description when task loads
    useEffect(() => {
        if (task) setDescInput(task.description || "");
    }, [task]);

    // 4. Progress Calculation
    const progressValue = useMemo(() => {
        if (!task?.subtasks || task.subtasks.length === 0) return 0;
        const completed = task.subtasks.filter(st => st.isCompleted).length;
        return Math.round((completed / task.subtasks.length) * 100);
    }, [task]);

    // Handlers
    const handleUpdate = (updates) => dispatch(updateTaskAction({ id, updates }));

    const handleSubtaskToggle = (stId, completed) => {
        const updatedSubtasks = task.subtasks.map(st => 
            st._id === stId ? { ...st, isCompleted: !completed } : st
        );
        handleUpdate({ subtasks: updatedSubtasks });
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
                    <button className="btn-add-schedule"><Calendar size={18} /> Add to Schedule</button>
                    <button className="btn-icon-settings"><Settings size={18} /></button>
                </div>
            </header>

            <div className="task-content-grid">
                <section className="main-info-panel">
                    <div className="task-input-group">
                        <label>Description:</label>
                        <textarea 
                            value={descInput}
                            onChange={(e) => setDescInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdate({ description: descInput })}
                            placeholder="Add a description and press Enter..."
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
                                        <button className="btn-sub-action"><Calendar size={14} /></button>
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
                        <div className="meta-item">
                            <div className="meta-label"><Calendar size={16}/> Date:</div>
                            <div className="meta-value text">
                                {task.createdAt ? new Date(task.createdAt).toISOString().split('T')[0] : 'N/A'} <Info size={12}/>
                            </div>
                        </div>
                        <div className="meta-item">
                            <div className="meta-label"><User size={16}/> Owner:</div>
                            <div className="meta-value text">Mark Sharmy <Info size={12}/></div>
                        </div>
                        <div className="meta-item">
                            <div className="meta-label"><Tag size={16}/> Category:</div>
                            <div className="meta-value badge light">{task.category} <Info size={12}/></div> {/* From Server */}
                        </div>
                        <div className="meta-item">
                            <div className="meta-label"><Folder size={16}/> Group:</div>
                            <div className="meta-value badge light">
                                {task.groupId?.name || 'Uncategorized'} <Info size={12}/> {/* From Populated Group */}
                            </div>
                        </div>
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
        </div>
    );
};

export default TaskDetails;