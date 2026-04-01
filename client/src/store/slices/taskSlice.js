import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

//Fetch today's planner ( Backend triggers Rollover automatically)
export const fetchDailyPlanner = createAsyncThunk(
    'tasks/fetchPlanner',
    async (date, { rejectWithValue }) => {
        try {

            const response = await API.get(`/api/tasks/planner/today`);
            return response.data.plannerItems;

        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

//Toggle Task or Subtask Status
export const updateItemStatus = createAsyncThunk(
    'tasks/updateStatus',
    async ({ id, parentTaskId, status }, { rejectWithValue }) => {
        try {

            let response;

            if (parentTaskId) {
                response = await API.patch(`/api/tasks/${parentTaskId}/subtasks/${id}`);
            }else {
                response = await API.patch(`/api/tasks/${id}/status`, { status });
            }

            return { data: response.data, iSubtask: !!parentTaskId, id };

        }catch(err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const taskSlice = createSlice({
    name: 'tasks',
    initialState: {
        planner: { tasks: [], subtasks: [] },
        loading: false,
        error: null,
    },
    reducers: {
        //Real-time update from socket.io
        syncTaskUpdate: (state, action) => {
            const index = state.planner.tasks.findIndex(t => t._id === action.payload._id);
            if (index !== -1) state.planner.tasks[index] = action.payload;
        },
        clearTaskError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDailyPlanner.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDailyPlanner.fulfilled, (state, action) => {
                state.loading = false;
                state.planner = action.payload;
            })
            .addCase(updateItemStatus.rejected, (state, action) => {
                state.error = action.payload.message;
            })
    }
});

export const { syncTaskUpdate, clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;