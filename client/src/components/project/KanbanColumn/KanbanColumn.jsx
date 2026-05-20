import { useRef, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { MoreHorizontal, Plus, Upload, X, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';
import { addTaskToColumn, addTasksFromCSV, deleteAllFromColumn } from '../../../store/slices/projectSlice';
import KanbanCard from '../KanbanCard/KanbanCard';
import './kanbanColumn.css';

/* ── CSV parser (same logic as TaskDetails) ── */
const parseCSVTitles = (text) => {
    const lines = text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(Boolean);

    // Skip header row heuristic: multi-column first row with all alpha cells
    let dataLines = lines;
    if (lines.length > 1) {
        const firstCells = lines[0].split(',');
        const looksLikeHeader = firstCells.length > 1 &&
            firstCells.every(c => /^["']?[a-zA-Z\s_-]+["']?$/.test(c.trim()));
        if (looksLikeHeader) dataLines = lines.slice(1);
    }

    const titles = dataLines
        .map(line => line.split(',')[0].replace(/^["']|["']$/g, '').trim())
        .filter(t => t.length > 0 && t.length <= 200);

    return [...new Set(titles)]; // deduplicate
};

const KanbanColumn = ({ title, tasks, columnId }) => {
    const { id: projectId } = useParams();
    const dispatch = useDispatch();

    const [menuOpen, setMenuOpen]         = useState(false);
    const [csvPreview, setCsvPreview]     = useState([]);
    const [csvError, setCsvError]         = useState('');
    const [csvFileName, setCsvFileName]   = useState('');
    const [importing, setImporting]       = useState(false);

    const menuRef    = useRef(null);
    const csvFileRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleAddItem = () => {
        if (projectId && columnId) {
            dispatch(addTaskToColumn({ projectId, columnId }));
        }
    };

    // ── CSV ────────────────────────────────────────────────────
    const handleCSVFile = (file) => {
        setCsvError('');
        setCsvPreview([]);

        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            setCsvError('Only .csv files are supported.');
            return;
        }
        if (file.size > 500 * 1024) {
            setCsvError('File too large. Maximum 500 KB.');
            return;
        }

        setCsvFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const titles = parseCSVTitles(e.target.result);
            if (titles.length === 0) {
                setCsvError('No valid task titles found in the file.');
                return;
            }
            setCsvPreview(titles);
        };
        reader.onerror = () => setCsvError('Failed to read the file.');
        reader.readAsText(file);
    };

    const handleFileInputChange = (e) => {
        handleCSVFile(e.target.files?.[0]);
        setMenuOpen(false);
    };

    const handleConfirmImport = async () => {
        if (!csvPreview.length || importing) return;
        setImporting(true);
        try {
            await dispatch(addTasksFromCSV({ projectId, columnId, titles: csvPreview })).unwrap();
        } catch (err) {
            setCsvError('Import failed. Please try again.');
        } finally {
            setImporting(false);
            setCsvPreview([]);
            setCsvFileName('');
            if (csvFileRef.current) csvFileRef.current.value = '';
        }
    };

    const handleCancelImport = () => {
        setCsvPreview([]);
        setCsvFileName('');
        setCsvError('');
        if (csvFileRef.current) csvFileRef.current.value = '';
    };
    // ──────────────────────────────────────────────────────────

    const handleDeleteAll = () => {
        setMenuOpen(false);
        if (!tasks?.length) return;
        if (!window.confirm(`Delete all ${tasks.length} task${tasks.length !== 1 ? 's' : ''} in "${title}"? This cannot be undone.`)) return;
        const taskIds = tasks.map(t => t._id);
        dispatch(deleteAllFromColumn({ projectId, columnId, taskIds }));
    };

    return (
        <div className="kanban-column">
            <header className="column-header">
                <div className="column-info">
                    <span className="column-title">{title}</span>
                    <span className="task-count">{tasks?.length || 0}</span>
                </div>
                <div className="header-actions">
                    <button className="icon-btn-small" onClick={handleAddItem} title="Add task">
                        <Plus size={16} />
                    </button>

                    {/* MoreHorizontal opens the column dropdown */}
                    <div className="column-menu-wrapper" ref={menuRef}>
                        <button
                            className="icon-btn-small"
                            onClick={() => setMenuOpen(o => !o)}
                            title="Column options"
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {menuOpen && (
                            <div className="column-dropdown">
                                <button
                                    className="column-dropdown-item"
                                    onClick={() => {
                                        setMenuOpen(false);
                                        csvFileRef.current?.click();
                                    }}
                                >
                                    <Upload size={14} /> Import from CSV
                                </button>
                                <button
                                    className="column-dropdown-item column-dropdown-item--danger"
                                    onClick={handleDeleteAll}
                                    disabled={!tasks?.length}
                                >
                                    <Trash2 size={14} /> Delete All
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={csvFileRef}
                        type="file"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={handleFileInputChange}
                    />
                </div>
            </header>

            {/* CSV preview bar — shown below the header when a file is parsed */}
            {(csvPreview.length > 0 || csvError) && (
                <div className="csv-import-bar">
                    {csvError ? (
                        <div className="csv-bar-error">
                            <AlertCircle size={13} />
                            <span>{csvError}</span>
                            <button className="csv-bar-dismiss" onClick={handleCancelImport}>
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <div className="csv-bar-preview">
                            <span className="csv-bar-label">
                                {importing
                                    ? <><Loader2 size={13} className="csv-spin" /> Importing…</>
                                    : <>{csvPreview.length} task{csvPreview.length !== 1 ? 's' : ''} from <em>{csvFileName}</em></>
                                }
                            </span>
                            {!importing && (
                                <div className="csv-bar-actions">
                                    <button className="csv-bar-confirm" onClick={handleConfirmImport}>
                                        Add
                                    </button>
                                    <button className="csv-bar-cancel" onClick={handleCancelImport}>
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                    <div
                        className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {tasks?.map((task, index) => (
                            <KanbanCard key={task._id} task={task} index={index} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default KanbanColumn;