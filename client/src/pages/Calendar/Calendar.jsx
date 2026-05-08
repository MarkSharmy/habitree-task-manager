import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Zap, ListTodo } from 'lucide-react';
import { fetchPlannerByDate, setActiveDate } from '../../store/slices/plannerSlice';
import { fetchTodayStats } from '../../store/slices/analyticsSlice';
import './calendar.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];
const CATEGORY_COLORS = {
    General: '#64748b', Watch: '#ec4899', Practice: '#8b5cf6',
    Read: '#3b82f6', Note: '#f59e0b', Project: '#22c55e',
};

const toDateStr = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const todayStr = () => new Date().toISOString().split('T')[0];

const formatMins = (mins) => {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const buildCalendarGrid = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();
    const cells = [];

    for (let i = firstDay - 1; i >= 0; i--) {
        const d = daysInPrev - i;
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear  = month === 0 ? year - 1 : year;
        cells.push({ day: d, month: prevMonth, year: prevYear, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, month, year, current: true });
    }
    const remaining = 42 - cells.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear  = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
        cells.push({ day: d, month: nextMonth, year: nextYear, current: false });
    }
    return cells;
};

const Calendar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const today = todayStr();
    const [viewYear, setViewYear]   = useState(new Date().getFullYear());
    const [viewMonth, setViewMonth] = useState(new Date().getMonth());
    const [selectedDate, setSelectedDate] = useState(today);

    const { dayData, loading: plannerLoading } = useSelector(state => state.planner);
    // Use analytics slice — it holds date-specific stats
    const { today: dayStats, loading: statsLoading } = useSelector(state => state.analytics);

    const grid = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);

    // Fetch planner + stats for the selected date whenever it changes
    useEffect(() => {
        dispatch(fetchPlannerByDate(selectedDate));
        dispatch(setActiveDate(selectedDate));
        dispatch(fetchTodayStats(selectedDate));
    }, [dispatch, selectedDate]);

    const prevMonth = useCallback(() => {
        setViewMonth(m => {
            if (m === 0) { setViewYear(y => y - 1); return 11; }
            return m - 1;
        });
    }, []);

    const nextMonth = useCallback(() => {
        setViewMonth(m => {
            if (m === 11) { setViewYear(y => y + 1); return 0; }
            return m + 1;
        });
    }, []);

    const goToToday = () => {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
        setSelectedDate(today);
    };

    const handleDayClick = (cell) => {
        const dateStr = toDateStr(cell.year, cell.month, cell.day);
        setSelectedDate(dateStr);
        if (!cell.current) {
            setViewYear(cell.year);
            setViewMonth(cell.month);
        }
    };

    const selectedTasks = dayData?.tasks || [];
    const isSelectedToday = selectedDate === today;

    // Label for the stats card header
    const statsDateLabel = isSelectedToday
        ? 'Today · Live'
        : formatDisplayDate(selectedDate).split(',')[0];

    return (
        <div className="calendar-container">
            <div className="calendar-page-header">
                <div>
                    <h1>Calendar</h1>
                    <p>View your scheduled tasks and daily productivity</p>
                </div>
            </div>

            <div className="calendar-layout">
                {/* ── Monthly grid ── */}
                <div className="calendar-panel">
                    <div className="calendar-nav">
                        <button className="calendar-nav-btn" onClick={prevMonth}>
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <span className="calendar-month-label">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="calendar-nav-btn today-btn" onClick={goToToday}>Today</button>
                            <button className="calendar-nav-btn" onClick={nextMonth}>
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="calendar-weekdays">
                        {WEEKDAYS.map(d => (
                            <div key={d} className="calendar-weekday">{d}</div>
                        ))}
                    </div>

                    <div className="calendar-grid">
                        {grid.map((cell, i) => {
                            const dateStr    = toDateStr(cell.year, cell.month, cell.day);
                            const isToday    = dateStr === today;
                            const isSelected = dateStr === selectedDate;
                            const isOther    = !cell.current;

                            return (
                                <div
                                    key={i}
                                    className={[
                                        'calendar-day',
                                        isOther    ? 'other-month' : '',
                                        isToday    ? 'is-today'    : '',
                                        isSelected ? 'is-selected' : '',
                                    ].join(' ')}
                                    onClick={() => handleDayClick(cell)}
                                >
                                    <div className="day-number">{cell.day}</div>
                                    {isSelected && selectedTasks.length > 0 && (
                                        <div className="day-task-pills">
                                            {selectedTasks.slice(0, 2).map((entry, idx) => {
                                                const task = entry.taskId;
                                                const cat  = task?.category?.toLowerCase() || 'general';
                                                return (
                                                    <div key={idx} className={`day-task-pill ${cat}`}>
                                                        {task?.title || 'Task'}
                                                    </div>
                                                );
                                            })}
                                            {selectedTasks.length > 2 && (
                                                <div className="day-overflow">
                                                    +{selectedTasks.length - 2} more
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {isToday && dayStats.totalMinutes > 0 && isSelected && (
                                        <div
                                            className="day-productivity-dot"
                                            style={{ background: '#22c55e' }}
                                            title={`${formatMins(dayStats.totalMinutes)} today`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Side panel ── */}
                <div className="calendar-side-panel">
                    {/* Stats card for the SELECTED date */}
                    <div className="side-panel-card">
                        <div className="side-panel-header">
                            <h3>
                                <Zap size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                                Productivity Stats
                            </h3>
                            <span className="side-panel-date-label">{statsDateLabel}</span>
                        </div>
                        <div className="side-panel-body">
                            {statsLoading ? (
                                <div style={{ padding: '1rem 0' }}>
                                    <BarLoader color="#3b82f6" width="100%" />
                                </div>
                            ) : (
                                <div className="day-stats-grid">
                                    <div className="day-stat-item">
                                        <span className="day-stat-label">Productive Time</span>
                                        <span className="day-stat-value">{formatMins(dayStats.totalMinutes)}</span>
                                        <span className="day-stat-sub">total for this day</span>
                                    </div>
                                    <div className="day-stat-item">
                                        <span className="day-stat-label">Efficiency</span>
                                        <span className="day-stat-value">
                                            {Math.round(dayStats.efficiencyScore * 100)}%
                                        </span>
                                        <span className="day-stat-sub">of 8h goal</span>
                                    </div>
                                    <div className="day-stat-item">
                                        <span className="day-stat-label">Sessions</span>
                                        <span className="day-stat-value">{dayStats.sessionsCount}</span>
                                        <span className="day-stat-sub">completed</span>
                                    </div>
                                    <div className="day-stat-item">
                                        <span className="day-stat-label">Remaining</span>
                                        <span className="day-stat-value">
                                            {formatMins(Math.max(0, 480 - dayStats.totalMinutes))}
                                        </span>
                                        <span className="day-stat-sub">to 8h</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scheduled tasks */}
                    <div className="side-panel-card">
                        <div className="side-panel-header">
                            <h3>
                                <ListTodo size={14} style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
                                Scheduled Tasks
                            </h3>
                            <span className="side-panel-date-label">
                                {formatDisplayDate(selectedDate).split(',')[0]}
                            </span>
                        </div>
                        <div className="side-panel-body" style={{ padding: '0.875rem 1.25rem' }}>
                            {plannerLoading ? (
                                <div style={{ padding: '1rem 0' }}>
                                    <BarLoader color="#3b82f6" width="100%" />
                                </div>
                            ) : selectedTasks.length > 0 ? (
                                <div className="side-task-list">
                                    {selectedTasks.map((entry, idx) => {
                                        const task = entry.taskId;
                                        if (!task) return null;
                                        const cat = task.category || 'General';
                                        return (
                                            <div
                                                key={entry._id || idx}
                                                className="side-task-item"
                                                onClick={() => navigate(`/tasks/${task._id}`)}
                                            >
                                                <div
                                                    className="side-task-category-dot"
                                                    style={{ background: CATEGORY_COLORS[cat] || '#64748b' }}
                                                />
                                                <div className="side-task-info">
                                                    <div className="side-task-title">{task.title}</div>
                                                    <div className="side-task-meta">
                                                        {cat}{task.groupId?.name && ` · ${task.groupId.name}`}
                                                    </div>
                                                </div>
                                                {entry.time && (
                                                    <span className="side-task-time">{entry.time}</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="side-empty-state">
                                    <CalendarIcon size={28} strokeWidth={1.5} />
                                    <p>No tasks scheduled</p>
                                    <small>
                                        {isSelectedToday
                                            ? 'Add tasks from the Dashboard.'
                                            : 'No tasks were scheduled for this date.'}
                                    </small>
                                </div>
                            )}

                            {isSelectedToday && (
                                <button
                                    className="btn-go-to-date"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Open Today's Planner
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Selected date chip */}
                    <div className="side-panel-card">
                        <div className="side-panel-body" style={{ padding: '0.875rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={14} color="var(--soft-text)" />
                                <span style={{ fontSize: '0.8rem', color: 'var(--soft-text)', fontWeight: 500 }}>
                                    Selected
                                </span>
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--dark-text)', marginTop: '0.3rem' }}>
                                {formatDisplayDate(selectedDate)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--light-text)', marginTop: '0.15rem' }}>
                                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} scheduled
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;