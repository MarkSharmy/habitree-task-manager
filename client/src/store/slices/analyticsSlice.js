import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

// Accepts optional date string for the summary cards
export const fetchTodayStats = createAsyncThunk(
    'analytics/fetchTodayStats',
    async (date, { rejectWithValue }) => {
        try {
            const params = date ? `?date=${date}` : '';
            const { data } = await API.get(`/stats/day${params}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

export const fetchWeeklyStats = createAsyncThunk(
    'analytics/fetchWeeklyStats',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/stats/weekly');
            return data.stats;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch weekly stats');
        }
    }
);

export const fetchMonthlyStats = createAsyncThunk(
    'analytics/fetchMonthlyStats',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/stats/monthly');
            return data.monthlyData;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch monthly stats');
        }
    }
);

export const fetchTaskVolumeStats = createAsyncThunk(
    'analytics/fetchTaskVolumeStats',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/stats/tasks');
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch task stats');
        }
    }
);

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState: {
        today: {
            totalMinutes: 0,
            efficiencyScore: 0,
            sessionsCount: 0,
            date: null,
        },
        weekly: [],
        monthly: [],
        tasks: {
            totalTasks: 0,
            completedTasks: 0,
            completionRate: '0%',
        },
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        const setLoading = (state) => { state.loading = true; state.error = null; };
        const setError = (state, action) => { state.loading = false; state.error = action.payload; };

        builder
            .addCase(fetchTodayStats.pending, setLoading)
            .addCase(fetchTodayStats.fulfilled, (state, action) => {
                state.loading = false;
                state.today = {
                    totalMinutes: action.payload.totalMinutes || 0,
                    efficiencyScore: action.payload.efficiencyScore || 0,
                    sessionsCount: action.payload.sessionsCount || 0,
                    date: action.payload.date || null,
                };
            })
            .addCase(fetchTodayStats.rejected, setError)

            .addCase(fetchWeeklyStats.pending, setLoading)
            .addCase(fetchWeeklyStats.fulfilled, (state, action) => {
                state.loading = false;
                state.weekly = action.payload || [];
            })
            .addCase(fetchWeeklyStats.rejected, setError)

            .addCase(fetchMonthlyStats.pending, setLoading)
            .addCase(fetchMonthlyStats.fulfilled, (state, action) => {
                state.loading = false;
                state.monthly = action.payload || [];
            })
            .addCase(fetchMonthlyStats.rejected, setError)

            .addCase(fetchTaskVolumeStats.pending, setLoading)
            .addCase(fetchTaskVolumeStats.fulfilled, (state, action) => {
                state.loading = false;
                state.tasks = {
                    totalTasks: action.payload.totalTasks || 0,
                    completedTasks: action.payload.completedTasks || 0,
                    completionRate: action.payload.completionRate || '0%',
                };
            })
            .addCase(fetchTaskVolumeStats.rejected, setError);
    },
});

export default analyticsSlice.reducer;