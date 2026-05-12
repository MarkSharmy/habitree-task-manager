import { useState, useEffect } from 'react';
import { X, Plus, Minus, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import './addMinutesModal.css';

const QUICK_PICKS = [15, 25, 30, 45, 60, 90];

const AddMinutesModal = ({ isOpen, onClose, onAdd, loading, activeDate }) => {
    const [minutes, setMinutes] = useState(25);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setMinutes(25);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (val) => {
        const parsed = parseInt(val, 10);
        if (isNaN(parsed)) {
            setMinutes('');
        } else {
            setMinutes(Math.max(1, Math.min(parsed, 720)));
        }
        setError('');
    };

    const step = (amount) => {
        setMinutes(prev => Math.max(1, Math.min((parseInt(prev) || 0) + amount, 720)));
        setError('');
    };

    const handleSubmit = () => {
        const mins = parseInt(minutes, 10);
        if (!mins || mins < 1) {
            setError('Please enter at least 1 minute.');
            return;
        }
        if (mins > 720) {
            setError('Maximum is 720 minutes (12 hours).');
            return;
        }
        onAdd(mins);
    };

    const formatDateLabel = (dateStr) => {
        if (!dateStr) return 'today';
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        if (isToday) return 'today';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    };

    const activeMinutes = parseInt(minutes, 10);

    return (
        <div className="add-minutes-overlay" onClick={onClose}>
            <div className="add-minutes-modal" onClick={(e) => e.stopPropagation()}>
                <div className="add-minutes-header">
                    <h3><Clock size={15} /> Add Minutes</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>

                <div className="add-minutes-body">
                    {/* Stepper input */}
                    <div>
                        <span className="add-minutes-label">How many minutes did you work?</span>
                        <div className="minutes-input-wrapper">
                            <button
                                className="minutes-stepper-btn"
                                onClick={() => step(-5)}
                                disabled={activeMinutes <= 1}
                            >
                                <Minus size={16} />
                            </button>
                            <input
                                type="number"
                                className="minutes-number-input"
                                value={minutes}
                                onChange={(e) => handleChange(e.target.value)}
                                min={1}
                                max={720}
                            />
                            <button
                                className="minutes-stepper-btn"
                                onClick={() => step(5)}
                                disabled={activeMinutes >= 720}
                            >
                                <Plus size={16} />
                            </button>
                            <span className="minutes-unit-label">mins</span>
                        </div>
                    </div>

                    {/* Quick picks */}
                    <div>
                        <span className="add-minutes-label">Quick pick</span>
                        <div className="quick-pick-row">
                            {QUICK_PICKS.map(val => (
                                <button
                                    key={val}
                                    className={`quick-pick-chip ${activeMinutes === val ? 'active' : ''}`}
                                    onClick={() => { setMinutes(val); setError(''); }}
                                >
                                    {val}m
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="add-minutes-error">
                            <AlertCircle size={13} /> {error}
                        </div>
                    )}

                    <p className="add-minutes-hint">
                        This will log a completed session of{' '}
                        <strong>{activeMinutes > 0 ? activeMinutes : '—'} minutes</strong>{' '}
                        for <strong>{formatDateLabel(activeDate)}</strong> and update your productivity stats.
                    </p>
                </div>

                <div className="add-minutes-footer">
                    <button className="btn-add-minutes-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn-add-minutes-submit"
                        onClick={handleSubmit}
                        disabled={loading || !activeMinutes || activeMinutes < 1}
                    >
                        {loading ? (
                            'Saving...'
                        ) : (
                            <><CheckCircle2 size={15} /> Add Minutes</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddMinutesModal;