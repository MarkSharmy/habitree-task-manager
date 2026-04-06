import { Code2, Layers, BookOpen, PlayCircle, StickyNote, Clock } from 'lucide-react';
import './taskitem.css';

const TaskItem = ({ item, isSubtask }) => {
    
    const categoryConfig = {
        PRACTICE: { color: '#6c5ce7', icon: <Code2 size={18} /> },
        PROJECT: { color: '#2ecc71', icon: <Layers size={18} /> },
        READ: { color: '#191b81', icon: <BookOpen size={18} /> },
        WATCH: { color: '#e84393', icon: <PlayCircle size={18} /> },
        NOTE: { color: '#f39c12', icon: <StickyNote size={18} /> }
    };

    return (
        <div className={`task-row ${isSubtask ? 'subtask-indent' : ''}`}>
            <div className="task-icon" style={{ backgroundColor: categoryConfig[item.category].color}}>
                {categoryConfig[item,catergory].icon}
            </div>
            <div className="task-info">
                <p className="task-title">{item.title}</p>
                <div className="task-meta">
                    <span className="category-label" style={{ color: catergoryColors[item.catergory]}}>
                        {item.category}
                    </span>
                    <div className="progress-bar-container">
                        <div className="progress-fill" style={{ width: `${item.progress || 0}%` }}></div>
                    </div>
                    <span className="progress-text">{item.process || 0}%</span>
                </div>
            </div>
            <div className="task-actions">
                <span className="time-cat">14:00</span>
                <button className="more-btn">•••</button>
            </div>
        </div>
    );
}

export default TaskItem;