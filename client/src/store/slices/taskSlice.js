import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

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
        loading: false,
        error: null
    },
    extraReducers: (builder) => {
        builder
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
            .addCase(updateTask.fulfilled, (state, action) => {
                const updatedTask = action.payload;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                const deletedId = action.payload;
            });
    }
});

export default taskSlice.reducer;