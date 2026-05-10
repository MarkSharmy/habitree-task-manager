import { Code2, Layers, BookOpen, PlayCircle, StickyNote, CheckCircle2 } from 'lucide-react';
import './planneritem.css';

const categoryConfig = {
    PRACTICE: { color: '#6c5ce7', icon: <Code2 size={18} /> },
    PROJECT:  { color: '#2ecc71', icon: <Layers size={18} /> },
    READ:     { color: '#191b81', icon: <BookOpen size={18} /> },
    WATCH:    { color: '#e84393', icon: <PlayCircle size={18} /> },
    NOTE:     { color: '#f39c12', icon: <StickyNote size={18} /> },
    DEFAULT:  { color: '#94a3b8', icon: <StickyNote size={18} /> },
};

const PlannerItem = ({ item, scheduledTime, specificSubtaskId }) => {
    if (!item) {
        return (
            <div className="task-row error-state">
                <div className="task-info">
                    <p className="task-title">Task data missing</p>
                </div>
            </div>
        );
    }

    const isSubtask = !!specificSubtaskId;
    const isCompleted = item.status === 'Completed';

    const displayTitle = isSubtask
        ? item.subtasks?.find(s => s._id === specificSubtaskId)?.title || item.title
        : item.title;

    const config = categoryConfig[item.category?.toUpperCase()] || categoryConfig.DEFAULT;

    const progress = (() => {
        if (!item.subtasks || item.subtasks.length === 0) {
            return isCompleted ? 100 : 0;
        }
        const completed = item.subtasks.filter(st => st.isCompleted).length;
        return Math.round((completed / item.subtasks.length) * 100);
    })();

    return (
        <div className={`task-row ${isSubtask ? 'subtask-indent' : ''} ${isCompleted ? 'completed' : ''}`}>
            <div className="task-icon" style={{ backgroundColor: config.color }}>
                {isCompleted ? <CheckCircle2 size={18} /> : config.icon}
            </div>

            <div className="task-info">
                <div className="task-title-row">
                    <p className="task-title">{displayTitle}</p>
                    {isCompleted && (
                        <span className="completed-badge">
                            <CheckCircle2 size={10} />
                            <span>Done</span>
                        </span>
                    )}
                </div>
                <div className="task-meta">
                    <span className="category-label" style={{ color: config.color }}>
                        {item.category}
                    </span>
                    <div className="progress-bar-container">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: isCompleted ? '#22c55e' : config.color,
                            }}
                        />
                    </div>
                    <span className="progress-text">{progress}%</span>
                </div>
            </div>

            <div className="task-actions">
                <span className="time-cat">{scheduledTime}</span>
                <button className="more-btn">•••</button>
            </div>
        </div>
    );
};

export default PlannerItem;