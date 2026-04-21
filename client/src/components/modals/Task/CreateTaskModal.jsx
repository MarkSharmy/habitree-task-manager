import { useState, useEffect } from 'react';
import { BeatLoader } from 'react-spinners';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGroups, createGroup } from '../../../store/slices/groupSlice';
import { X, Plus, Hash, Code, BookOpen, PlayCircle, FileText } from 'lucide-react';

import Logo from '../../../assets/logo.png';
import './createTaskModal.css';

const CreateTaskModal = ({ isOpen, onClose, onCreate}) => {

    const dispatch = useDispatch();
    const { list: groups, loading: groupsLoading } = useSelector((state) => state.groups);

    const [taskTitle, setTaskTitle] = useState('');
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [category, setCategory] = useState('General');
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');

    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupColor, setNewGroupColor] = useState('#ff00bb');

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchGroups());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (groups.length > 0 && !selectedGroupId) {
            setSelectedGroupId(groups[0]._id);
        }
    }, [groups, selectedGroupId]);

    if (!isOpen) return null;

    const handleAddGroup = async () => {
        if (!newGroupName.trim()) return;
        const result = await dispatch(createGroup({
            name: newGroupName,
            color: newGroupColor
        }));

        if (result.payload) {
            setNewGroupName('');
            setSelectedGroupId(result.payload._id);
        }
    }

    const handleAddSubtask = () =>{
        if(newSubtask.trim()) {
            setSubtasks([...subtasks, newSubtask]);
            setNewSubtask('');
        }
    }

    const removeSubtask = (index) => {
        setSubtasks(subtasks.filter((_, i) => i != index));
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <div className="modal-logo"><img src={Logo} style={{height: '2.5rem'}}/> <h2>Create New Task</h2> </div>
                    <button className="close-btn" onClick={onClose}><X size={20} strokeWidth={2} /></button>
                </header>

                {groupsLoading ? (
                    <div className="modal-loader-body">
                        <BeatLoader color="#3b82f6" />
                    </div>
                ) : (
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Task Title</label>
                            <input
                                type="text"
                                placeholder="e.g., Start Node Dev Course"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                            />
                        </div>

                        <div className="group-row">
                            <div className="form-group flex-2">
                                <label>Select Group</label>
                                <select 
                                    value={selectedGroupId} 
                                    onChange={(e) => setSelectedGroupId(e.target.value)}
                                >
                                    {groups.map(g => (
                                        <option key={g._id} value={g._id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group flex-2">
                                <label>New Group Name:</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Marketing" 
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Color:</label>
                                <div className="color-picker-wrapper">
                                    <input 
                                        type="color" 
                                        value={newGroupColor} 
                                        onChange={(e) => setNewGroupColor(e.target.value)} 
                                    />
                                    <button className="add-group-btn" onClick={handleAddGroup}>Add Group</button>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <div className="category-options">
                                {[
                                    { id: 'General', icon: <Hash size={14} /> },
                                    { id: 'Practice', icon: <Code size={14} /> },
                                    { id: 'Read', icon: <BookOpen size={14} /> },
                                    { id: 'Watch', icon: <PlayCircle size={14} /> },
                                    { id: 'Note', icon: <FileText size={14} /> }
                                ].map((cat) => (
                                    <button 
                                        key={cat.id}
                                        className={`cat-btn ${category === cat.id ? 'active' : ''}`}
                                        onClick={() => setCategory(cat.id)}
                                    >
                                        {cat.icon} {cat.id}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Subtasks</label>
                            <div className="subtasks-list">
                                {subtasks.map((st, index) => (
                                    <div key={index} className="subtask-item">
                                        <input type="text" defaultValue={st} readOnly />
                                        <button onClick={() => removeSubtask(index)}><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="add-subtask-row">
                                <input 
                                    type="text"
                                    placeholder="e.g., add subtask"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSubtask();
                                        }
                                    }}
                                />
                                <button className="inline-add-btn" onClick={handleAddSubtask}>Add Subtask</button>
                            </div>
                        </div>
                    </div>
                )}

                <footer className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="create-btn" onClick={() => onCreate({ taskTitle, selectedGroupId, category, subtasks })}>
                        Create Task
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default CreateTaskModal;