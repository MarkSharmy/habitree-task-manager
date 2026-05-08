import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    MarkerType,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { BarLoader } from 'react-spinners';
import {
    ArrowLeft, Settings, Save, Plus, Trash2,
    Edit3, CheckCircle, AlertTriangle, Search
} from 'lucide-react';
import {
    fetchRoadmapById,
    saveRoadmapCanvas,
    updateRoadmapMeta,
    deleteRoadmap,
    clearActiveRoadmap,
} from '../../store/slices/roadmapSlice';
import { fetchInventoryTasks } from '../../store/slices/taskSlice';
import CreateRoadmap from '../../components/modals/Roadmap/CreateRoadmap';
import './roadmapCanvas.css';

/* ── Detect mobile ── */
const isMobile = () => window.innerWidth <= 768;

/* ── Status helpers ── */
const STATUS_CLASS = {
    'Completed':  'completed',
    'On-Going':   'on-going',
    'Shelved':    'shelved',
    'Not Started':'not-started',
};

const PROGRESS_COLOR = (pct) => {
    if (pct >= 100) return '#22c55e';
    if (pct >= 50)  return '#3b82f6';
    if (pct > 0)    return '#f59e0b';
    return '#e2e8f0';
};

/* ── Custom Task Node ── */
const TaskNode = ({ data, selected, isConnectable }) => {
    const statusClass = STATUS_CLASS[data.status] || 'not-started';
    const isComplete  = data.status === 'Completed';
    const progress    = data.progress || 0;

    return (
        <div className={`task-node ${statusClass} ${selected ? 'selected' : ''}`}>
            {isComplete && (
                <div className="task-node-complete-badge">
                    <CheckCircle size={10} color="white" fill="white" />
                </div>
            )}

            {/* Handles for connecting edges — isConnectable must be forwarded */}
            <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ background: '#94a3b8', width: 8, height: 8 }} />
            <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ background: '#94a3b8', width: 8, height: 8 }} />

            <div className="task-node-header">
                <span className="task-node-title">{data.label || 'Untitled Task'}</span>
                {!isMobile() && data.onDelete && (
                    <button
                        className="task-node-delete-btn"
                        onClick={(e) => { e.stopPropagation(); data.onDelete(data.id); }}
                        title="Remove node"
                    >
                        <Trash2 size={12} />
                    </button>
                )}
            </div>

            <div className={`task-node-status ${statusClass}`}>
                {data.status || 'Not Started'}
            </div>

            <div className="task-node-progress">
                <div className="task-node-progress-bar-bg">
                    <div
                        className="task-node-progress-fill"
                        style={{
                            width: `${progress}%`,
                            background: PROGRESS_COLOR(progress),
                        }}
                    />
                </div>
                <div className="task-node-progress-label">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
            </div>
        </div>
    );
};

const nodeTypes = { taskNode: TaskNode };

/* ── Default edge style ── */
const DEFAULT_EDGE_OPTIONS = {
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
    animated: false,
};

/* ── Main Canvas Component ── */
const RoadmapCanvas = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const readonly = isMobile();

    const { activeRoadmap, loading, saving } = useSelector(state => state.roadmaps);
    const { inventory } = useSelector(state => state.tasks);

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const [searchQuery, setSearchQuery]   = useState('');
    const [showSearch, setShowSearch]     = useState(false);
    const [saveStatus, setSaveStatus]     = useState('idle'); // idle | saving | saved
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);

    const settingsRef = useRef(null);
    const saveTimerRef = useRef(null);
    const deleteNodeRef = useRef(null); // stable ref so populate effect never goes stale

    /* ── Load data on mount ── */
    useEffect(() => {
        dispatch(fetchRoadmapById(id));
        dispatch(fetchInventoryTasks());
        return () => dispatch(clearActiveRoadmap());
    }, [dispatch, id]);

    /* ── Populate flow from Redux ── */
    useEffect(() => {
        if (!activeRoadmap) return;

        const flowNodes = (activeRoadmap.nodes || []).map(n => ({
            id: n.id,
            type: 'taskNode',
            position: n.position || { x: 0, y: 0 },
            data: {
                id: n.id,
                label: n.data?.label || 'Task',
                progress: n.data?.progress || 0,
                status: n.data?.status || 'Not Started',
                onDelete: (nodeId) => deleteNodeRef.current?.(nodeId),
            },
        }));

        const flowEdges = (activeRoadmap.edges || []).map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            animated: e.animated || false,
            label: e.label || '',
            ...DEFAULT_EDGE_OPTIONS,
        }));

        setNodes(flowNodes);
        setEdges(flowEdges);
    }, [activeRoadmap]);

    /* ── Close settings on outside click ── */
    useEffect(() => {
        const handler = (e) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* ── Flat task list from inventory ── */
    const allTasks = useMemo(() => {
        return Object.values(inventory).flat();
    }, [inventory]);

    const filteredTasks = useMemo(() => {
        if (!searchQuery.trim()) return allTasks.slice(0, 8);
        const q = searchQuery.toLowerCase();
        return allTasks.filter(t =>
            t.title?.toLowerCase().includes(q) ||
            t.category?.toLowerCase().includes(q)
        ).slice(0, 10);
    }, [allTasks, searchQuery]);

    /* ── Node already on canvas check ── */
    const nodeIds = useMemo(() => new Set(nodes.map(n => n.id)), [nodes]);

    /* ── Add task as node ── */
    const handleAddTaskNode = useCallback((task) => {
        if (nodeIds.has(task._id)) return;

        const offset = nodes.length * 30;
        const newNode = {
            id: task._id,
            type: 'taskNode',
            position: { x: 200 + offset, y: 150 + offset },
            data: {
                id: task._id,
                label: task.title,
                progress: task.progress || 0,
                status: task.status || 'Not Started',
                onDelete: (nodeId) => deleteNodeRef.current?.(nodeId),
            },
        };

        setNodes(nds => [...nds, newNode]);
        setSearchQuery('');
        setShowSearch(false);
    }, [nodes, nodeIds, setNodes]);

    /* ── Delete node + its edges ── */
    const handleDeleteNode = useCallback((nodeId) => {
        setNodes(nds => nds.filter(n => n.id !== nodeId));
        setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    }, [setNodes, setEdges]);

    // Keep ref in sync so the populate effect's proxy always calls the latest version
    deleteNodeRef.current = handleDeleteNode;

    /* ── Connect nodes ── */
    const onConnect = useCallback((params) => {
        setEdges(eds => addEdge({
            ...params,
            id: `e-${params.source}-${params.target}-${Date.now()}`,
            ...DEFAULT_EDGE_OPTIONS,
        }, eds));
    }, [setEdges]);

    /* ── Save canvas to backend ── */
    const handleSave = useCallback(async () => {
        if (!activeRoadmap || saving) return;
        setSaveStatus('saving');

        const serialisedNodes = nodes.map(n => ({
            id: n.id,
            type: n.type || 'taskNode',
            position: n.position,
            data: {
                label: n.data.label,
                progress: n.data.progress,
                status: n.data.status,
            },
        }));

        const serialisedEdges = edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            animated: e.animated || false,
            label: e.label || '',
        }));

        try {
            await dispatch(saveRoadmapCanvas({
                skillName: activeRoadmap.skillName,
                nodes: serialisedNodes,
                edges: serialisedEdges,
                zoom: 1,
                pan: { x: 0, y: 0 },
            })).unwrap();
            setSaveStatus('saved');
            clearTimeout(saveTimerRef.current);
            saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error('Save failed:', err);
            setSaveStatus('idle');
        }
    }, [activeRoadmap, nodes, edges, saving, dispatch]);

    /* ── Edit roadmap name ── */
    const handleEditMeta = async (formData) => {
        setEditSubmitting(true);
        try {
            await dispatch(updateRoadmapMeta({ id, skillName: formData.skillName })).unwrap();
            setEditModalOpen(false);
            setSettingsOpen(false);
        } catch (err) {
            console.error('Edit failed:', err);
        } finally {
            setEditSubmitting(false);
        }
    };

    /* ── Delete roadmap ── */
    const handleDelete = async () => {
        if (!window.confirm(`Delete "${activeRoadmap?.skillName}"? This cannot be undone.`)) return;
        try {
            await dispatch(deleteRoadmap(id)).unwrap();
            navigate('/roadmaps');
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    if (loading && !activeRoadmap) return (
        <div className="details-loader-container">
            <BarLoader color="#3b82f6" />
            <p>Loading Roadmap...</p>
        </div>
    );

    if (!activeRoadmap) return null;

    return (
        <div className="roadmap-canvas-page">
            {/* Read-only banner on mobile */}
            {readonly && (
                <div className="canvas-readonly-banner">
                    <AlertTriangle size={14} />
                    View-only mode — editing roadmaps is available on desktop.
                </div>
            )}

            {/* ── Toolbar ── */}
            <div className="canvas-toolbar">
                <div className="canvas-toolbar-left">
                    <button className="canvas-back-btn" onClick={() => navigate('/roadmaps')}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="canvas-title-block">
                        <span className="canvas-title">{activeRoadmap.skillName}</span>
                        <span className="canvas-subtitle">
                            {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {edges.length} connection{edges.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                <div className="canvas-toolbar-right">
                    {/* Save status indicator */}
                    {saveStatus === 'saving' && (
                        <span className="canvas-save-indicator saving">Saving...</span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="canvas-save-indicator saved">
                            <CheckCircle size={13} /> Saved
                        </span>
                    )}

                    {!readonly && (
                        <>
                            {/* Add task button */}
                            <button
                                className="btn-canvas-action"
                                onClick={() => setShowSearch(s => !s)}
                                title="Add task node"
                            >
                                <Plus size={16} />
                                <span>Add Task</span>
                            </button>

                            {/* Save button */}
                            <button
                                className="btn-canvas-action primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                <Save size={15} />
                                <span>{saving ? 'Saving...' : 'Save'}</span>
                            </button>
                        </>
                    )}

                    {/* Settings dropdown */}
                    <div className="canvas-settings-wrapper" ref={settingsRef}>
                        <button
                            className="btn-canvas-action"
                            onClick={() => setSettingsOpen(o => !o)}
                            title="Settings"
                        >
                            <Settings size={15} />
                            <span>Settings</span>
                        </button>

                        {settingsOpen && (
                            <div className="canvas-settings-dropdown">
                                <button
                                    className="canvas-dropdown-item"
                                    onClick={() => { setEditModalOpen(true); setSettingsOpen(false); }}
                                >
                                    <Edit3 size={14} /> Edit Name
                                </button>
                                <button
                                    className="canvas-dropdown-item danger"
                                    onClick={handleDelete}
                                >
                                    <Trash2 size={14} /> Delete Roadmap
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── React Flow canvas ── */}
            <div className="canvas-flow-wrapper">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={readonly ? undefined : onNodesChange}
                    onEdgesChange={readonly ? undefined : onEdgesChange}
                    onConnect={readonly ? undefined : onConnect}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    nodesDraggable={!readonly}
                    nodesConnectable={!readonly}
                    elementsSelectable={!readonly}
                    deleteKeyCode={readonly ? null : 'Delete'}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background color="#d1d5db" gap={24} size={1} />
                    <Controls showInteractive={false} />
                    {!isMobile() && (
                        <MiniMap
                            nodeColor={(n) => {
                                const s = n.data?.status;
                                if (s === 'Completed') return '#22c55e';
                                if (s === 'On-Going')  return '#3b82f6';
                                return '#94a3b8';
                            }}
                            maskColor="rgba(248, 250, 252, 0.7)"
                        />
                    )}
                </ReactFlow>

                {/* Empty canvas hint */}
                {nodes.length === 0 && (
                    <div className="canvas-empty-hint">
                        <GitBranchIcon />
                        <p>Your roadmap is empty</p>
                        <small>
                            Click <strong>Add Task</strong> in the toolbar to search for tasks and add them as
                            nodes. Then drag between nodes to create connections.
                        </small>
                    </div>
                )}

                {/* Task search panel (floating, bottom) */}
                {!readonly && showSearch && (
                    <div className="add-node-panel">
                        <Search size={16} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search tasks to add as nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <button
                            className="btn-add-node"
                            onClick={() => setShowSearch(false)}
                        >
                            Close
                        </button>

                        {/* Task dropdown */}
                        {(filteredTasks.length > 0 || searchQuery) && (
                            <div className="task-search-dropdown">
                                {filteredTasks.length === 0 ? (
                                    <div className="task-search-item">
                                        <div className="task-search-item-title" style={{ color: '#94a3b8' }}>
                                            No tasks found
                                        </div>
                                    </div>
                                ) : (
                                    filteredTasks.map(task => (
                                        <div
                                            key={task._id}
                                            className="task-search-item"
                                            onClick={() => handleAddTaskNode(task)}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div className="task-search-item-title">
                                                    {task.title}
                                                    {nodeIds.has(task._id) && (
                                                        <span style={{ color: '#22c55e', marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                                                            ✓ Added
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="task-search-item-meta">
                                                    {task.category}
                                                    {task.groupId?.name && ` · ${task.groupId.name}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Edit roadmap name modal */}
            <CreateRoadmap
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSubmit={handleEditMeta}
                initialData={activeRoadmap}
                loading={editSubmitting}
            />
        </div>
    );
};

/* Inline SVG icon to avoid import issues */
const GitBranchIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
        <line x1="6" y1="3" x2="6" y2="15" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
);

export default RoadmapCanvas;