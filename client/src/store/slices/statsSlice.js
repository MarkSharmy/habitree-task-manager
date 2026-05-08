import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

// Accepts an optional date string (YYYY-MM-DD). Defaults to today on the backend.
export const fetchTodayStats = createAsyncThunk(
    'stats/today',
    async (date) => {
        const params = date ? `?date=${date}` : '';
        const response = await API.get(`/stats/day${params}`);
        return response.data;
    }
);

const statsSlice = createSlice({
    name: 'stats',
    initialState: {
        efficiencyScore: 0,
        totalProductivityMinutes: 0,
        sessionsCount: 0,
        activeDate: null,
        loading: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodayStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTodayStats.fulfilled, (state, action) => {
                state.loading = false;
                state.efficiencyScore = action.payload.efficiencyScore || 0;
                state.totalProductivityMinutes =
                    action.payload.totalMinutes || action.payload.totalProductivityMinutes || 0;
                state.sessionsCount = action.payload.sessionsCount || 0;
                state.activeDate = action.payload.date || null;
            })
            .addCase(fetchTodayStats.rejected, (state) => {
                state.loading = false;
            });
    },
});

export default statsSlice.reducer;