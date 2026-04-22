import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const saveWorkSession = createAsyncThunk(
    'session/save',
    async (sessionData, { rejectWithValue }) => {
        try {
            const response = await API.post('/sessions', sessionData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const sessionSlice = createSlice({
    name: 'session',
    initialState: {
        sessions: [],
        saving: false, // Added to track POST status
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(saveWorkSession.pending, (state) => {
                state.saving = true;
            })
            .addCase(saveWorkSession.fulfilled, (state, action) => {
                state.saving = false;
                state.sessions.push(action.payload);
            })
            .addCase(saveWorkSession.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload?.message;
            });
    }
});

export default sessionSlice.reducer;