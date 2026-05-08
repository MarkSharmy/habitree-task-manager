import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarLoader } from 'react-spinners';
import { Clock, Zap, CheckSquare, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    fetchTodayStats,
    fetchWeeklyStats,
    fetchMonthlyStats,
    fetchTaskVolumeStats,
} from '../../store/slices/analyticsSlice';
import './analytics.css';

/* ── Helpers ── */
const formatMins = (mins) => {
    if (!mins) return '0h 0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const shortDay = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
};

const shortDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatFullDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};

const todayStr = () => new Date().toISOString().split('T')[0];

const stepDate = (dateStr, days) => {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

const efficiencyColor = (score) => {
    if (score >= 0.75) return '#22c55e';
    if (score >= 0.5)  return '#3b82f6';
    if (score >= 0.25) return '#f59e0b';
    return '#e2e8f0';
};

const heatLevel = (mins) => {
    if (!mins || mins === 0) return 0;
    if (mins < 60)  return 1;
    if (mins < 180) return 2;
    if (mins < 300) return 3;
    return 4;
};

const buildMonthGrid = (monthlyData) => {
    const map = {};
    monthlyData.forEach(d => { map[d._id] = d; });
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        cells.push({ key, day, data: map[key] || null });
    }
    return cells;
};

/* ── Sub-components ── */
const StatCard = ({ label, value, sub, icon: Icon, colorClass }) => (
    <div className="analytics-stat-card">
        <div className="stat-card-top">
            <span className="stat-card-label">{label}</span>
            <div className={`stat-card-icon ${colorClass}`}>
                <Icon size={16} strokeWidth={2} />
            </div>
        </div>
        <div className="stat-card-value">{value}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
);

const BarChart = ({ data, valueKey, labelFn, color }) => {
    if (!data || data.length === 0) {
        return <div className="empty-chart-state"><Activity size={24} /><span>No data for this period</span></div>;
    }
    const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
    return (
        <div className="bar-chart">
            {data.map((d, i) => {
                const pct = ((d[valueKey] || 0) / max) * 100;
                const tip = `${labelFn(d._id)}: ${formatMins(d.totalMinutes)}`;
                return (
                    <div className="bar-col" key={i}>
                        <div
                            className="bar-fill"
                            style={{ height: `${Math.max(pct, 2)}%`, background: color }}
                            data-tip={tip}
                            title={tip}
                        />
                        <span className="bar-label">{labelFn(d._id)}</span>
                    </div>
                );
            })}
        </div>
    );
};

const EfficiencyRing = ({ score, sessionsCount, totalMinutes, dateLabel }) => {
    const pct   = Math.min(score * 100, 100);
    const radius = 40;
    const circ   = 2 * Math.PI * radius;
    const dash   = (pct / 100) * circ;
    const color  = efficiencyColor(score);

    return (
        <div className="efficiency-ring-panel">
            <svg width="110" height="110" viewBox="0 0 110 110" className="ring-svg">
                <circle cx="55" cy="55" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <circle
                    cx="55" cy="55" r={radius} fill="none"
                    stroke={color} strokeWidth="10"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                />
                <text x="55" y="50" textAnchor="middle"
                    style={{ fontSize: '1rem', fontWeight: 700, fill: '#1e293b', fontFamily: 'Rubik' }}>
                    {Math.round(pct)}%
                </text>
                <text x="55" y="64" textAnchor="middle"
                    style={{ fontSize: '0.6rem', fill: '#94a3b8', fontFamily: 'Rubik' }}>
                    of 8h goal
                </text>
            </svg>
            <div className="efficiency-legend">
                <div className="legend-row">
                    <span className="legend-label">
                        <span className="legend-dot" style={{ background: color }} />
                        Productive Time
                    </span>
                    <span className="legend-value">{formatMins(totalMinutes)}</span>
                </div>
                <div className="legend-row">
                    <span className="legend-label">
                        <span className="legend-dot" style={{ background: '#e2e8f0' }} />
                        Remaining
                    </span>
                    <span className="legend-value">{formatMins(Math.max(0, 480 - totalMinutes))}</span>
                </div>
                <div className="legend-row">
                    <span className="legend-label">Sessions</span>
                    <span className="legend-value">{sessionsCount}</span>
                </div>
            </div>
            {dateLabel && (
                <div style={{ fontSize: '0.7rem', color: 'var(--light-text)', textAlign: 'center', marginTop: '0.25rem' }}>
                    {dateLabel}
                </div>
            )}
        </div>
    );
};

const MonthlyHeatmap = ({ monthlyData }) => {
    const cells = buildMonthGrid(monthlyData);
    return (
        <div className="heatmap-grid">
            {cells.map(({ key, day, data }) => (
                <div
                    key={key}
                    className={`heatmap-cell level-${heatLevel(data?.totalMinutes)}`}
                    title={data ? `${shortDate(key)}: ${formatMins(data.totalMinutes)}` : shortDate(key)}
                />
            ))}
        </div>
    );
};

const TaskBreakdown = ({ tasks }) => {
    const incomplete    = tasks.totalTasks - tasks.completedTasks;
    const completedPct  = tasks.totalTasks > 0 ? (tasks.completedTasks / tasks.totalTasks) * 100 : 0;
    const incompletePct = 100 - completedPct;

    return (
        <div className="task-stat-list">
            <div className="task-stat-row">
                <span className="task-stat-label">Completed</span>
                <div className="task-stat-bar-bg">
                    <div className="task-stat-bar-fill" style={{ width: `${completedPct}%`, background: '#22c55e' }} />
                </div>
                <span className="task-stat-count">{tasks.completedTasks}</span>
            </div>
            <div className="task-stat-row">
                <span className="task-stat-label">Incomplete</span>
                <div className="task-stat-bar-bg">
                    <div className="task-stat-bar-fill" style={{ width: `${incompletePct}%`, background: '#f59e0b' }} />
                </div>
                <span className="task-stat-count">{incomplete}</span>
            </div>
            <div className="task-stat-row">
                <span className="task-stat-label">Total</span>
                <div className="task-stat-bar-bg">
                    <div className="task-stat-bar-fill" style={{ width: '100%', background: '#3b82f6' }} />
                </div>
                <span className="task-stat-count">{tasks.totalTasks}</span>
            </div>
        </div>
    );
};

/* ── Main page ── */
const Analytics = () => {
    const dispatch = useDispatch();
    const [period, setPeriod]           = useState('weekly');
    const [selectedDate, setSelectedDate] = useState(todayStr());

    const { today, weekly, monthly, tasks, loading } = useSelector(state => state.analytics);
    const isToday = selectedDate === todayStr();

    // Fetch day stats for the selected date
    useEffect(() => {
        dispatch(fetchTodayStats(selectedDate));
        dispatch(fetchTaskVolumeStats());
    }, [dispatch, selectedDate]);

    // Fetch chart data when period changes
    useEffect(() => {
        if (period === 'weekly')  dispatch(fetchWeeklyStats());
        if (period === 'monthly') dispatch(fetchMonthlyStats());
    }, [dispatch, period]);

    const handleDateStep = (step) => {
        setSelectedDate(prev => stepDate(prev, step));
    };

    const dateLabel = isToday ? 'Today' : formatFullDate(selectedDate);

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <h1>Analytics</h1>
                <p>Your productivity insights and performance trends</p>
            </div>

            {/* Date navigator for the summary cards */}
            <div className="analytics-date-nav">
                <button className="analytics-date-btn" onClick={() => handleDateStep(-1)}>
                    <ChevronLeft size={16} />
                </button>
                <span className="analytics-date-label">
                    {isToday ? 'Today' : shortDate(selectedDate)}
                </span>
                <button
                    className="analytics-date-btn"
                    onClick={() => handleDateStep(1)}
                    disabled={isToday}
                >
                    <ChevronRight size={16} />
                </button>
                {!isToday && (
                    <button
                        className="analytics-date-btn analytics-today-btn"
                        onClick={() => setSelectedDate(todayStr())}
                    >
                        Today
                    </button>
                )}
            </div>

            {/* Summary cards for the selected date */}
            <div className="stat-cards-row">
                <StatCard
                    label="Productive Time"
                    value={formatMins(today.totalMinutes)}
                    sub={`${today.sessionsCount} session${today.sessionsCount !== 1 ? 's' : ''} · ${dateLabel}`}
                    icon={Clock}
                    colorClass="blue"
                />
                <StatCard
                    label="Efficiency Score"
                    value={`${Math.round(today.efficiencyScore * 100)}%`}
                    sub={`of 8-hour goal · ${dateLabel}`}
                    icon={Zap}
                    colorClass="amber"
                />
                <StatCard
                    label="Tasks Completed"
                    value={tasks.completedTasks}
                    sub={`of ${tasks.totalTasks} total`}
                    icon={CheckSquare}
                    colorClass="green"
                />
                <StatCard
                    label="Completion Rate"
                    value={tasks.completionRate}
                    sub="all-time"
                    icon={Activity}
                    colorClass="violet"
                />
            </div>

            {/* Period tabs — for the charts only */}
            <div className="period-tabs">
                <button
                    className={`period-tab ${period === 'weekly' ? 'active' : ''}`}
                    onClick={() => setPeriod('weekly')}
                >
                    This Week
                </button>
                <button
                    className={`period-tab ${period === 'monthly' ? 'active' : ''}`}
                    onClick={() => setPeriod('monthly')}
                >
                    This Month
                </button>
            </div>

            {loading ? (
                <div className="details-loader-container">
                    <BarLoader color="#3b82f6" />
                    <p>Loading analytics...</p>
                </div>
            ) : (
                <>
                    <div className="charts-grid">
                        <div className="chart-panel">
                            <div className="chart-panel-header">
                                <div>
                                    <h3>Productivity Over Time</h3>
                                    <p>
                                        {period === 'weekly'
                                            ? 'Total productive minutes per day, last 7 days'
                                            : 'Total productive minutes per day this month'}
                                    </p>
                                </div>
                            </div>
                            {period === 'weekly' ? (
                                <BarChart data={weekly} valueKey="totalMinutes" labelFn={shortDay} color="#3b82f6" />
                            ) : (
                                <MonthlyHeatmap monthlyData={monthly} />
                            )}
                        </div>

                        <div className="chart-panel">
                            <div className="chart-panel-header">
                                <div>
                                    <h3>Efficiency — {isToday ? 'Today' : shortDate(selectedDate)}</h3>
                                    <p>Productive hours vs 8-hour goal</p>
                                </div>
                            </div>
                            <EfficiencyRing
                                score={today.efficiencyScore}
                                sessionsCount={today.sessionsCount}
                                totalMinutes={today.totalMinutes}
                                dateLabel={!isToday ? formatFullDate(selectedDate) : null}
                            />
                        </div>
                    </div>

                    <div className="task-breakdown-row">
                        <div className="chart-panel">
                            <div className="chart-panel-header">
                                <div>
                                    <h3>Task Breakdown</h3>
                                    <p>Completed vs incomplete tasks all-time</p>
                                </div>
                            </div>
                            <TaskBreakdown tasks={tasks} />
                        </div>

                        <div className="chart-panel">
                            <div className="chart-panel-header">
                                <div>
                                    <h3>{period === 'weekly' ? 'Weekly Summary' : 'Monthly Summary'}</h3>
                                    <p>Sessions and hours by day</p>
                                </div>
                            </div>
                            {(period === 'weekly' ? weekly : monthly).length === 0 ? (
                                <div className="empty-chart-state">
                                    <Activity size={24} />
                                    <span>No sessions recorded yet</span>
                                </div>
                            ) : (
                                <table className="session-log-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Sessions</th>
                                            <th>Total Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(period === 'weekly' ? weekly : monthly).map((row) => (
                                            <tr key={row._id}>
                                                <td>{shortDate(row._id)}</td>
                                                <td>{row.sessionCount}</td>
                                                <td>{formatMins(row.totalMinutes)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Analytics;