import './taskitem.css';

const TaskItem = ({ item, isSubtask }) => {
    
    const catergoryColors = {
        PRACTICE: '#6c5ce7',
        PROJECT: '#2ecc71',
        READ: '#2d3436',
        WATCH: '#e84393',
        NOTE: '#f39c12',
    };

    return (
        <div className={`task-row ${isSubtask ? 'subtask-indent' : ''}`}>
            <div className="task-icon" style={{ backgroundColor: categoryColors[item.category]}}>
                {/* Logic for icons goes here */}
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