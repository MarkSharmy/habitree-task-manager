import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import './moveCardModal.css';

const MoveCardModal = ({ isOpen, onClose, task, onMove, columnKeys }) => {
    const [selectedColumn, setSelectedColumn] = useState(task.kanban);

    if (!isOpen) return null;

    const quickOptions = ['todo', 'doing', 'done'];

    return (
        <div className="modal-overlay">
            <div className="move-modal-content">
                <div className="modal-header">
                    <h3>Move Card</h3>
                    <X className="close-icon" onClick={onClose} size={20} />
                </div>

                <div className="quick-move-section">
                    {quickOptions.map((option) => (
                        <button 
                            key={option}
                            className={`quick-option-btn ${selectedColumn === option ? 'active' : ''}`}
                            onClick={() => setSelectedColumn(option)}
                        >
                            <ArrowRight size={16} />
                            <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                        </button>
                    ))}
                </div>

                <div className="full-list-section">
                    <label>List</label>
                    <select 
                        value={selectedColumn} 
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        className="column-select"
                    >
                        {columnKeys.map((key) => (
                            <option key={key} value={key}>
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </option>
                        ))}
                    </select>
                </div>

                <button 
                    className="move-submit-btn" 
                    onClick={() => onMove(task._id, task.kanban, selectedColumn)}
                >
                    Move
                </button>
            </div>
        </div>
    );
};

export default MoveCardModal;