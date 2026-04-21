import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const fetchTaskById = createAsyncThunk(
    'tasks/fetchById',
    async (taskId, { rejectWithValue }) => {
        try{
            const response = await API.get(`/tasks/${taskId}`);
            return response.data;
        }catch(error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchInventoryTasks = createAsyncThunk(
    'tasks/fetchAll', 
    async () => {
        const response = await API.get('/tasks');
        return response.data;
    }
);

export const createNewTask = createAsyncThunk(
    'tasks/create',
    async (taskData) => {
        const response = await API.post('/tasks', taskData);
        return response.data;
    }
);

export const updateTask = createAsyncThunk(
    'tasks/update',
    async ({ id, updates }) => {
        const response = await API.put(`/tasks/${id}`, updates);
        return response.data;
    }
);

export const updateTaskAction = createAsyncThunk(
    'tasks/updateTask',
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/tasks/${id}`, updates);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const deleteTask = createAsyncThunk(
    'tasks/delete',
    async (id) => {
        await API.delete(`/tasks/${id}`);
        return id;
    }
);

const taskSlice = createSlice({
    name: 'tasks',
    initialState: {
        inventory: {},
        currentTask: null,
        loading: false,
        detailsLoading: false,
        error: null,
    },
    reducers: {
        clearCurrentTask: (state) => {
            state.currentTask = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTaskById.pending, (state) => {
                state.detailsLoading = true;
            })
            .addCase(fetchTaskById.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.currentTask = action.payload;
            })
            .addCase(fetchTaskById.rejected, (state, action) => {
                state.detailsLoading = false;
                state.error = action.payload?.message;
            })
            .addCase(fetchInventoryTasks.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchInventoryTasks.fulfilled, (state, action) => {
                state.loading = false;
                state.inventory = action.payload;
            })
            .addCase(createNewTask.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(updateTaskAction.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateTaskAction.fulfilled, (state, action) => {
                state.currentTask = action.payload;
                state.loading = false;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                const deletedId = action.payload;
            });
    }
});

export const { clearCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;