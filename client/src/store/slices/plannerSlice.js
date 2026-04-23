import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const fetchPlannerByDate = createAsyncThunk(
    'planner/fetchByDate',
    async (date, { rejectWithValue }) => {
        try {
            const response = await API.get(`/planner/${date}`);
            console.log(response.data);
            return response.data;
        }catch(error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const assignTaskToDate = createAsyncThunk(
    'planner/assignTask',
    async ({ date, taskId, subtaskId, time, comments }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/planner/${date}/add`, { 
                taskId, 
                subtaskId, 
                time, 
                comments 
            });
            return response.data;
        } catch(error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const plannerSlice = createSlice({
    name: 'planner',
    initialState: {
        activeDate: new Date().toISOString().split('T')[0],
        dayData: { tasks: [] },
        loading: false,
        scheduling: false,
        error: null
    },
    reducers: {
        setActiveDate: (state, action) => {
            state.activeDate = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlannerByDate.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPlannerByDate.fulfilled, (state, action) => {
                state.loading = false;
                state.dayData = action.payload;
            })
            .addCase(fetchPlannerByDate.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(assignTaskToDate.pending, (state) => {
                state.scheduling = true;
            })
            .addCase(assignTaskToDate.fulfilled, (state, action) => {
                state.scheduling = false;
                state.dayData = action.payload;
            })
            .addCase(assignTaskToDate.rejected, (state, action) => {
                state.scheduling = false;
                state.error = action.payload?.message;
            });
    }
})

export const { setActiveDate } = plannerSlice.actions;
export default plannerSlice.reducer;