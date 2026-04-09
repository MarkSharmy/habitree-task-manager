import { useState, useEffect } from 'react';
import { X, Play, Info, Minus, Plus} from 'lucide-react';
import './session.css';

import Logo from '../../../assets/logo.png';

const SessionSettings = ({ isOpen, onClose, onStart }) => {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    //Calculate total seconds for the slider logic
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    const maxSeconds = 3600 * 3;

    const handleQuickTime = (mins) => {
        setHours(Math.floor(mins /60));
        setMinutes(mins % 60);
        setSeconds(0);
    };

    const adjustUnit = (unit, amount) => {
        if (unit === 'h') setHours(prev => Math.max(0, prev + amount));
        if (unit === 'm') setMinutes(prev => Math.max(0, Math.min(59, prev + amount)));
        if (unit === 's') setSeconds(prev => Math.max(0, Math.min(59, prev + amount)));
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="session-modal">
                <header className="modal-header">
                    <div className="modal-logo"><img src={Logo} style={{height: '2.5rem'}}/> Habitree</div>
                    <button className="close-btn" onClick={onClose}><X size={20} strokeWidth={2} /></button>
                </header>

                <div className="modal-body">
                    <span className="label-input">Set Timer</span>

                    <div className="main-timer-display">
                        {String(hours).padStart(2, '0')}:
                        {String(minutes).padStart(2, '0')}:
                        {String(seconds).padStart(2, '0')}
                    </div>

                    <div className="timer-controls-grid">
                        <TimeUnit label="Hours" value={hours} onAdj={(amt) => adjustUnit('h', amount)} />
                        <TimeUnit label="Minutes" value={minutes} onAdj={(amt) => adjustUnit('m', amount)} />
                        <TimeUnit label="Seconds" value={seconds} onAdj={(amt) => adjustUnit('s', amount)} />
                    </div>

                    <div className="slider-containe">
                        <input
                            type="range"
                            min="0"
                            max={maxSeconds}
                            value={totalSeconds}
                            onChange={(e) => handleQuickTime(Math.floor(e.target.value / 60))}
                            className="timer-range-slider"
                        />
                    </div>

                    <div className="quick-times">
                        <span className="quick-label">Quick Times:</span>
                        <button onClick={() => handleQuickTime(20)} className="qt-btn active">20 mins (Pomodoro)</button>
                        <button onClick={() => handleQuickTime(30)} className="qt-btn">30 mins</button>
                        <button onClick={() => handleQuickTime(40)} className="qt-btn">40 mins</button>
                        <button onClick={() => handleQuickTime(60)} className="qt-btn">60 mins</button>
                    </div>
                </div>

                <footer className="modal-footer">
                    <div className="footer-actions">
                        <button className="btn-start" onClick={() => {}}>
                            <Play size={20} strokeWidth={2} fill="currentColor" /> Start Session
                        </button>
                        <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    </div>
                    <div className="footer info">
                        <Info size={20} strokeWidth={2} />
                        <p>Timer countdown will begin upon 'Start Session'</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

const TimeUnit = ({ label, value, onAdj }) => (
    <div className="time-unit-box">
        <div className="unit-controls">
            <button onClick={() => onAdj(-1)}><Minus size={14} /></button>
            <span className="unit-value">{String(value).padStart(2, '0')}</span>
            <button onClick={() => onAdj(1)}><Plus size={14} /></button>
        </div>
        <span className="unit-label">{label}</span>
    </div>
);

export default SessionSettings;