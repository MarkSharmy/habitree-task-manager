import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { BarLoader } from 'react-spinners';
import {
    fetchTaskById,
    clearCurrentTask,
    updateTaskAction,
    deleteTask
} from '../../store/slices/taskSlice';
import ScheduleTaskModal from '../../components/modals/Scheduler/SchedulerModal';
import {
    Calendar, Settings, ListTodo,
    Trash2, PlayCircle, Edit3, Upload, X, CheckCircle2, AlertCircle
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

    // CSV import state
    const [csvPreview, setCsvPreview]     = useState([]);   // parsed titles ready to import
    const [csvError, setCsvError]         = useState('');   // parse/validation message
    const [csvFileName, setCsvFileName]   = useState('');   // display name
    const [isDragOver, setIsDragOver]     = useState(false);
    const csvInputRef = useRef(null);

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

    const handleToggleSubtask = (stId) => {
        const updatedSubtasks = task.subtasks.map(s =>
            s._id === stId
                ? { ...s, isCompleted: !s.isCompleted, status: !s.isCompleted ? 'Completed' : 'Not Started' }
                : s
        );
        handleUpdate({ subtasks: updatedSubtasks });
    };

    const openScheduler = (item = task) => {
        const itemWithContext = item._id === task._id
            ? item
            : { ...item, parentId: task._id, category: task.category, groupId: task.groupId };

        setSelectedItemForSchedule(itemWithContext);
        setIsScheduleModalOpen(true);
    };

    // ── CSV helpers ──────────────────────────────────────────────
    const parseCSV = (text) => {
        const existingTitles = new Set(
            (task.subtasks || []).map(s => s.title.trim().toLowerCase())
        );

        const lines = text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);

        // Skip a header row if every value in the first line looks like a label
        // (i.e. no numbers, short words — heuristic: if the first row has all
        //  alpha-only tokens and more than one column, treat it as a header)
        let dataLines = lines;
        if (lines.length > 1) {
            const firstCells = lines[0].split(',');
            const looksLikeHeader = firstCells.every(c =>
                /^["']?[a-zA-Z\s_-]+["']?$/.test(c.trim())
            );
            if (looksLikeHeader && firstCells.length > 1) {
                dataLines = lines.slice(1);
            }
        }

        const titles = dataLines
            .map(line => {
                // Take the first column; strip surrounding quotes
                const firstCol = line.split(',')[0].replace(/^["']|["']$/g, '').trim();
                return firstCol;
            })
            .filter(t => t.length > 0 && t.length <= 200)
            .filter(t => !existingTitles.has(t.toLowerCase())); // skip duplicates

        return [...new Set(titles)]; // deduplicate within the file itself
    };

    const handleCSVFile = (file) => {
        setCsvError('');
        setCsvPreview([]);

        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            setCsvError('Only .csv files are supported.');
            return;
        }
        if (file.size > 500 * 1024) {
            setCsvError('File is too large. Maximum size is 500 KB.');
            return;
        }

        setCsvFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const titles = parseCSV(text);

            if (titles.length === 0) {
                setCsvError('No new subtask titles found. The file may be empty, already imported, or contain invalid data.');
                return;
            }
            setCsvPreview(titles);
        };
        reader.onerror = () => setCsvError('Failed to read the file.');
        reader.readAsText(file);
    };

    const handleCSVInputChange = (e) => handleCSVFile(e.target.files?.[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleCSVFile(e.dataTransfer.files?.[0]);
    };

    const handleConfirmImport = () => {
        if (csvPreview.length === 0) return;
        const newSubtasks = csvPreview.map(title => ({ title, isCompleted: false }));
        const merged = [...(task.subtasks || []), ...newSubtasks];
        handleUpdate({ subtasks: merged });
        setCsvPreview([]);
        setCsvFileName('');
        if (csvInputRef.current) csvInputRef.current.value = '';
    };

    const handleCancelImport = () => {
        setCsvPreview([]);
        setCsvFileName('');
        setCsvError('');
        if (csvInputRef.current) csvInputRef.current.value = '';
    };
    // ─────────────────────────────────────────────────────────────

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
                                <div
                                    key={st._id || index}
                                    className={`detail-subtask-item ${st.isCompleted ? 'completed' : ''}`}
                                >
                                    <div className="subtask-left">
                                        <label
                                            className="subtask-toggle"
                                            title={st.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={!!st.isCompleted}
                                                onChange={() => handleToggleSubtask(st._id)}
                                            />
                                            <span className="subtask-toggle-slider" />
                                        </label>
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

                        {/* ── CSV import ── */}
                        {csvPreview.length === 0 ? (
                            <div
                                className={`csv-drop-zone ${isDragOver ? 'drag-over' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                onDragLeave={() => setIsDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => csvInputRef.current?.click()}
                            >
                                <Upload size={16} />
                                <span>
                                    {csvFileName
                                        ? csvFileName
                                        : 'Import subtasks from CSV — click or drag & drop'}
                                </span>
                                <input
                                    ref={csvInputRef}
                                    type="file"
                                    accept=".csv"
                                    style={{ display: 'none' }}
                                    onChange={handleCSVInputChange}
                                />
                            </div>
                        ) : (
                            <div className="csv-preview-panel">
                                <div className="csv-preview-header">
                                    <span className="csv-preview-title">
                                        <CheckCircle2 size={14} />
                                        {csvPreview.length} subtask{csvPreview.length !== 1 ? 's' : ''} ready to import
                                    </span>
                                    <button className="csv-cancel-btn" onClick={handleCancelImport}>
                                        <X size={14} />
                                    </button>
                                </div>
                                <ul className="csv-preview-list">
                                    {csvPreview.slice(0, 8).map((title, i) => (
                                        <li key={i} className="csv-preview-item">
                                            <ListTodo size={12} />
                                            <span>{title}</span>
                                        </li>
                                    ))}
                                    {csvPreview.length > 8 && (
                                        <li className="csv-preview-more">
                                            +{csvPreview.length - 8} more
                                        </li>
                                    )}
                                </ul>
                                <button className="csv-confirm-btn" onClick={handleConfirmImport}>
                                    <Upload size={14} /> Add {csvPreview.length} Subtasks
                                </button>
                            </div>
                        )}

                        {csvError && (
                            <div className="csv-error-msg">
                                <AlertCircle size={13} /> {csvError}
                            </div>
                        )}
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