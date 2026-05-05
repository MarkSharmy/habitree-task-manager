import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { X, Play, Pause, RotateCcw, Square, Info } from 'lucide-react';
import { BeatLoader } from 'react-spinners';
import './sessionCommon.css';

import Logo from '../../../assets/logo.png';

const SessionModal = ({ isOpen, initialSeconds, onClose, onFinish }) => {
    const { saving } = useSelector((state) => state.session);

    const [secondsLeft, setSeconds] = useState(initialSeconds);
    const [isActive, setActive] = useState(true);

    const endTimeRef = useRef(null);
    const bellRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));

    useEffect(() => {
        if (isOpen) {
            endTimeRef.current = Date.now() + (initialSeconds * 1000);
            setSeconds(initialSeconds);
            setActive(true);

            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }, [isOpen, initialSeconds]);

    useEffect(() => {
        let interval = null;
        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => {
                const now = Date.now();
                const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
                setSeconds(remaining);
                if (remaining <= 0) {
                    clearInterval(interval);
                    handleTimerComplete();
                }
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isActive, secondsLeft]);

    const togglePause = () => {
        if (isActive) {
            setActive(false);
        } else {
            endTimeRef.current = Date.now() + (secondsLeft * 1000);
            setActive(true);
        }
    };

    const handleReset = () => {
        endTimeRef.current = Date.now() + (initialSeconds * 1000);
        setSeconds(initialSeconds);
    };

    const handleTimerComplete = () => {
        if (isActive) bellRef.current.play();
        if (Notification.permission === 'granted') {
            new Notification('Habitree: Session Completed!', {
                body: 'Time to take a break or start a new task.',
                icon: Logo,
            });
        }
    };

    const handleStopSession = () => {
        const endTime = new Date();
        const secondsElapsed = initialSeconds - secondsLeft;
        const startTime = new Date(endTime.getTime() - secondsElapsed * 1000);
        const durationMinutes = Math.floor(secondsElapsed / 60);

        onFinish({
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            durationMinutes,
        });
    };

    const formatTime = (totalS) => {
        const hrs = Math.floor(totalS / 3600);
        const mins = Math.floor((totalS % 3600) / 60);
        const secs = totalS % 60;
        return {
            h: String(hrs).padStart(2, '0'),
            m: String(mins).padStart(2, '0'),
            s: String(secs).padStart(2, '0'),
        };
    };

    const time = formatTime(secondsLeft);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="session-modal">
                <header className="modal-header">
                    <div className="modal-logo">
                        <img src={Logo} style={{ height: '2rem' }} alt="Habitree" />
                        Habitree
                    </div>
                    {!saving && (
                        <button className="close-btn" onClick={onClose}>
                            <X size={20} strokeWidth={2} />
                        </button>
                    )}
                </header>

                <div className="session-modal-body">
                    {saving ? (
                        <div className="sync-loading-container">
                            <BeatLoader color="#3b82f6" size={15} />
                            <p className="sync-text">Updating Sessions...</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="session-status">
                                Session: <span className="status-blue">On Going</span>
                            </h3>

                            <div className="countdown-container">
                                <div className="countdown-circle">
                                    <div className="time-numbers">
                                        {time.h}:{time.m}:{time.s}
                                    </div>
                                    <div className="time-labels">
                                        <span>hrs</span>
                                        <span>min</span>
                                        <span>sec</span>
                                    </div>
                                </div>
                            </div>

                            <div className="session-actions">
                                <button className="action-btn btn-resume" onClick={togglePause} disabled={isActive}>
                                    <Play size={16} fill="currentColor" /> Start
                                </button>
                                <button className="action-btn btn-pause" onClick={togglePause} disabled={!isActive}>
                                    <Pause size={16} fill="currentColor" /> Pause
                                </button>
                                <button className="action-btn btn-reset" onClick={handleReset}>
                                    <RotateCcw size={16} /> Reset
                                </button>
                                <button className="action-btn btn-stop" onClick={handleStopSession}>
                                    <Square size={16} fill="currentColor" /> Stop
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <div className="session-footer-info">
                    <Info size={15} />
                    <span>Session will be added to Today's Productivity</span>
                </div>
            </div>
        </div>
    );
};

export default SessionModal;