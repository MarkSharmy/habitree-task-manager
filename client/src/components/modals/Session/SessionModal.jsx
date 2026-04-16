import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, Plus, Minus, RotateCcw, Square, Info } from 'lucide-react';
import './sessionCommon.css';

import Logo from '../../../assets/logo.png';

const SessionModal = ({ isOpen, initialSeconds, onClose, onFinish }) => {
    
    const [secondsLeft, setSeconds] = useState(initialSeconds);
    const [isActive, setActive] = useState(true);
    const [extraMins, setExtraMins] = useState(5);

    const endTimeRef = useRef(null);
    const bellRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
    
    useEffect(() => {
        if (isOpen) {
            endTimeRef.current = Date.now() + (initialSeconds * 1000);
            setSeconds(initialSeconds);
            setActive(true)

            //Request nofication permission when modal opens
            if (Notification.permission === "default") {
                Notification.requestPermission();
            }
        }
    }, [isOpen, initialSeconds]);

    //Countdown logic
    useEffect(() => {
        let interval = null;

        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => {
                // Calculate actual difference between 'now' and 'target'
                const now = Date.now();
                const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
                
                setSeconds(remaining);

                if (remaining <= 0) {
                    clearInterval(interval);
                    handleTimerComplete();
                }
            }, 500); // Check every 500ms for smoothness, but logic is time-based
        }

        return () => clearInterval(interval);
    }, [isActive, secondsLeft]);

    // When user pauses, we need to handle the "End Time" shift
    const togglePause = () => {
        if (isActive) {
            // Pausing: Just stop the interval
            setActive(false);
        } else {
            // Resuming: Recalculate the new target end time based on seconds left
            endTimeRef.current = Date.now() + (secondsLeft * 1000);
            setActive(true);
        }
    };

    const handleReset = () => {
        endTimeRef.current = Date.now() + (initialSeconds * 1000);
        setSeconds(initialSeconds);
    };

    const handleTimerComplete = () => {
        //Only play is the session modal is open
        if (isActive) bellRef.current.play();

        //Browser notification to get user's attention
        if (Notification.permission === "granted") {
            new Notification("Habitree: Session Completed!", {
                body: "Time to take a break or start a new task.",
                icon: Logo
            });
        }
    }

    const handleStopSession = () => {
        const endTime = new Date();

        const secondsElapsed = initialSeconds - secondsLeft;
        const startTime = new Date(endTime.getTime() - secondsElapsed * 1000);
        const durationMinutes = Math.floor(secondsElapsed / 60);

        onFinish({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            durationMinutes
        });
    }

    const handleAddTime = () => {
        const addedSeconds = extraMins * 60;

        endTimeRef.current += (addedSeconds * 1000);
        setSeconds(prev => prev + addedSeconds);
        setActive(true);
    }

    //Format time logic
    const formatTime = (totalS) => {
        const hrs = Math.floor(totalS / 3600);
        const mins = Math.floor((totalS % 3600 )/ 60);
        const secs = totalS % 60;

        return {
            h: String(hrs).padStart(2, '0'),
            m: String(mins).padStart(2, '0'),
            s: String(secs).padStart(2, '0')
        };
    }

    const time = formatTime(secondsLeft);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="session-modal">
                <header className="modal-header">
                    <div className="modal-logo"><img src={Logo} style={{height: '2.5rem'}}/> Habitree</div>
                    <button className="close-btn" onClick={onClose}><X size={20} strokeWidth={2} /></button>
                </header>

                <div className="modal-body">
                    <h3 className="session-status">
                        Session: <span className="status-blue">On Going</span>
                    </h3>
                    

                    <div className="countdown-container">
                        <div className="countdown-circle">
                            <div className="time-numbers">
                                <span>{time.h}</span>:
                                <span>{time.m}</span>:
                                <span>{time.s}</span>
                            </div>
                            <div className="time-labels">
                                <span>hrs</span>
                                <span>min</span>
                                <span>sec</span>
                            </div>
                        </div>
                    </div>

                    <div className="extra-time-controls">
                        <div className="counter-stepper">
                            <button onClick={() => setExtraMins(m => Math.max(1, m - 5))}><Minus size={16} /></button>
                            <span>{extraMins} mins</span>
                            <button onClick={() => setExtraMins(m => m + 5)}><Plus size={16} /></button>
                        </div>
                        <button className="btn-add-time" onClick={handleAddTime}>Add Time</button>
                    </div>

                    <div className="session-actions">
                        <button className="action-btn btn-resume" onClick={togglePause} disabled={isActive}>
                            <Play size={18} fill="currentColor" /> Start
                        </button>
                        <button className="action-btn btn-pause" onClick={togglePause} disabled={!isActive}>
                            <Pause size={18} fill="currentColor" /> Pause
                        </button>
                        <button className="action-btn btn-reset" onClick={handleReset}>
                            <RotateCcw size={18}/> Reset
                        </button>
                        <button className="action-btn btn-stop" onClick={handleStopSession}>
                            <Square size={18} fill="currentColor" /> Stop
                        </button>
                    </div>
                </div>

                <footer className="modal-footer">
                    <span><Info size={16} /></span>
                    <p>Session will be added to Today's Productivity</p>
                </footer>
            </div>
        </div>
    );

}

export default SessionModal;