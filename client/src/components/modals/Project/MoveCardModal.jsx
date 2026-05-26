import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import './moveCardModal.css';

const QUICK_OPTIONS = ['todo', 'doing', 'done'];

const formatKey = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

/**
 * Dual-mode move modal.
 *
 * Single-card mode  — pass { task, onMove, columnKeys }
 * Bulk mode         — pass { selectedCount, onMoveSelected, columnKeys }
 */
const MoveCardModal = ({ isOpen, onClose, task, onMove, columnKeys, selectedCount, onMoveSelected, moving }) => {
    const isBulk = selectedCount !== undefined;

    const [selectedColumn, setSelectedColumn] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Default selection: task's current column (single) or 'todo' (bulk)
            setSelectedColumn(isBulk ? 'todo' : (task?.kanban || 'todo'));
        }
    }, [isOpen, task, isBulk]);

    if (!isOpen) return null;

    const handleMove = () => {
        if (!selectedColumn) return;
        if (isBulk) {
            onMoveSelected?.(selectedColumn);
        } else {
            onMove?.(task._id, task.kanban, selectedColumn);
        }
    };

    const title    = isBulk ? `Move ${selectedCount} Task${selectedCount !== 1 ? 's' : ''}` : 'Move Card';
    const subLabel = isBulk
        ? `Select the column to move ${selectedCount} selected task${selectedCount !== 1 ? 's' : ''} to.`
        : task?.title;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="move-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <X className="close-icon" onClick={onClose} size={20} />
                </div>

                {subLabel && (
                    <p className="move-modal-subtitle">{subLabel}</p>
                )}

                {/* Quick picks */}
                <div className="quick-move-section">
                    {QUICK_OPTIONS.map(option => (
                        <button
                            key={option}
                            className={`quick-option-btn ${selectedColumn === option ? 'active' : ''}`}
                            onClick={() => setSelectedColumn(option)}
                        >
                            <ArrowRight size={16} />
                            <span>{formatKey(option)}</span>
                        </button>
                    ))}
                </div>

                {/* Full column list */}
                <div className="full-list-section">
                    <label>All columns</label>
                    <select
                        value={selectedColumn}
                        onChange={e => setSelectedColumn(e.target.value)}
                        className="column-select"
                    >
                        {(columnKeys || []).map(key => (
                            <option key={key} value={key}>{formatKey(key)}</option>
                        ))}
                    </select>
                </div>

                <button
                    className="move-submit-btn"
                    onClick={handleMove}
                    disabled={!selectedColumn || moving}
                >
                    {moving ? 'Moving...' : isBulk ? `Move ${selectedCount} Tasks` : 'Move'}
                </button>
            </div>
        </div>
    );
};

export default MoveCardModal;