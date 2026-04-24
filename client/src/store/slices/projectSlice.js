import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const fetchSingleProject = createAsyncThunk(
    'projects/fetchSingle',
    async (projectId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/projects/${projectId}`);
            return response.data.project;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchProjects = createAsyncThunk(
    'projects/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/projects');
            return response.data.projects;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// NEW: Thunk to create a project
export const createProject = createAsyncThunk(
    'projects/create',
    async (projectData, { rejectWithValue }) => {
        try {
            const response = await API.post('/projects', projectData);
            return response.data.project; 
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

const projectSlice = createSlice({
    name: 'projects',
    initialState: {
        items: [],
        currentProject: null,
        loading: false,
        error: null,
        createLoading: false, 
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSingleProject.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSingleProject.fulfilled, (state, action) => {
                state.loading = false;
                state.currentProject = action.payload;
            })
            .addCase(fetchSingleProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })
            .addCase(fetchProjects.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message;
            })

            .addCase(createProject.pending, (state) => {
                state.createLoading = true;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.createLoading = false;
                state.items.unshift(action.payload);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.createLoading = false;
                state.error = action.payload?.message;
            });
    }
});

export default projectSlice.reducer;