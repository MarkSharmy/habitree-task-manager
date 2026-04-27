import { Info } from 'lucide-react';
import './efficiencywidget.css';


const EfficiencyWidget = ({ score = 0}) => {
    const percentage = score * 100;
    const rotation = score * 360;

    return (
        <div className="stat-card efficiency-card">
            <div className="card-title-row">
                <h4>Today's Efficiency Score</h4>
                <Info size={16} strokeWidth={2} className="info-icon" />
            </div>

            <div className="stat-progress-container">
                <div
                    className="stat-circular-progress"
                    style={{ 
                        background: `conic-gradient(#3498db ${rotation}deg, #ebf0f1 ${rotation}deg)` 
                    }}
                >
                    <div className="stat-inner-circle">
                        <span className="score-number">{score.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EfficiencyWidget;