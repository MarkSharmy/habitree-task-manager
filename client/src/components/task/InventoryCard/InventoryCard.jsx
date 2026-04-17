import { Calendar as CalendarIcon, Folder } from 'lucide-react';
import './inventoryCard.css';

const InventoryCard = ({ title, category, progress, date, status, groupColor }) => {
    return (
        <div className="inventory-card">
            <div className="card-top">
                {/* Use groupColor directly, with a fallback if undefined */}
                <div 
                    className="icon-box" 
                    style={{ backgroundColor: groupColor || '#3b82f6' }}
                >
                    <Folder size={16} color="white" />
                </div>
                <span className={`status-tag ${status.toLowerCase().replace(' ', '-')}`}>
                    {status}
                </span>
            </div>

            <div className="card-body">
                <h3>{title}</h3>
                <span className="category-label">{category}</span>

                <div className="progress-section">
                    <div className="progress-text">
                        <span>PROGRESS</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                        <div 
                            className="progress-bar-fill" 
                            style={{ 
                                width: `${progress}%`,
                                backgroundColor: groupColor || '#3b82f6' // Matches bar color to group icon
                            }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="card-footer">
                <div className="date-info">
                    <CalendarIcon size={14} />
                    <span>{date}</span>
                </div>
                <button className="edit-task-link">EDIT TASK</button>
            </div>
        </div>
    );
}

export default InventoryCard;