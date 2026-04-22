import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const fetchTodayStats = createAsyncThunk(
    'stats/today',
    async () => {
        const response = await API.get('/stats/today');
        return response.data;
    }
);

const statsSlice = createSlice({
    name: 'stats',
    initialState: {
        efficiencyScore: 0,
        totalProductivityMinutes: 0,
        loading: false
    },
    extraReducers: (builder) => {
    builder
        .addCase(fetchTodayStats.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchTodayStats.fulfilled, (state, action) => {
            state.loading = false;
            state.efficiencyScore = action.payload.efficiencyScore || 0;
            state.totalProductivityMinutes = action.payload.totalMinutes || action.payload.totalProductivityMinutes || 0;
        })
        .addCase(fetchTodayStats.rejected, (state) => {
            state.loading = false;
        });
}
});

export default statsSlice.reducer;