import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const startFocusSession = createAsyncThunk(
    'session/start',
    async () => {
        const response = await API.post('/api/sessions/start');
        return response.data.session;
    }
);

export const endFocusSession = createAsyncThunk(
    'session/end',
    async ({ sessionId, durationMinutes }, { rejectWithValue }) => {
        try {

            const response = await API.put(`/api/sessions/${sessionId}/stop`, { durationMinutes });
            return res.data.session;

        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const sessionSlice = createSlice({
    name: 'session',
    initialState: {
        currentSessionId: null,
        isActive: false,
        todayStats: { totalHours: 0, effeciencyScore: '0%' }
    },
    reducers: {
        //For locall timer ticking without hitting on the DB
        setTodayStats: (state, action) => {
            state.todayStats = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(startFocusSession.fulfilled, (state, action) => {
                state.currentSessionId = action.payload._id;
                state.isActive = true;
            })
            .addCase(endFocusSession.fulfilled, (state) => {
                state.currentSessionId = null;
                state.isActive = false;
            })
    }
});

export const { setTodayStats } = sessionSlice.actions;
export default sessionSlice.reducer;