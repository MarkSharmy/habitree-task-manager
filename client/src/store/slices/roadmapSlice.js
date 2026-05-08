import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const fetchUserRoadmaps = createAsyncThunk(
    'roadmap/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/roadmaps');
            return data.roadmaps;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch roadmaps');
        }
    }
);

export const fetchRoadmapById = createAsyncThunk(
    'roadmap/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await API.get(`/roadmaps/${id}`);
            return data.roadmap;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch roadmap');
        }
    }
);

export const createRoadmap = createAsyncThunk(
    'roadmap/create',
    async (roadmapData, { rejectWithValue }) => {
        try {
            const { data } = await API.post('/roadmaps', roadmapData);
            return data.roadmap;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create roadmap');
        }
    }
);

export const saveRoadmapCanvas = createAsyncThunk(
    'roadmap/saveCanvas',
    async ({ skillName, nodes, edges, zoom, pan }, { rejectWithValue }) => {
        try {
            const { data } = await API.post('/roadmaps', { skillName, nodes, edges, zoom, pan });
            return data.roadmap;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to save roadmap');
        }
    }
);

export const updateRoadmapMeta = createAsyncThunk(
    'roadmap/updateMeta',
    async ({ id, skillName }, { rejectWithValue }) => {
        try {
            const { data } = await API.put(`/roadmaps/${id}`, { skillName });
            return data.roadmap;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update roadmap');
        }
    }
);

export const deleteRoadmap = createAsyncThunk(
    'roadmap/delete',
    async (id, { rejectWithValue }) => {
        try {
            await API.delete(`/roadmaps/${id}`);
            return id;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete roadmap');
        }
    }
);

const roadmapSlice = createSlice({
    name: 'roadmap',
    initialState: {
        list: [],
        activeRoadmap: null,
        nodes: [],
        edges: [],
        loading: false,
        saving: false,
        error: null,
    },
    reducers: {
        updateNodeData: (state, action) => {
            const { nodeId, progress, status } = action.payload;
            const node = state.nodes.find(n => n.id === nodeId);
            if (node) {
                node.data = { ...node.data, progress, status };
            }
        },
        setNodes: (state, action) => {
            state.nodes = action.payload;
        },
        setEdges: (state, action) => {
            state.edges = action.payload;
        },
        clearActiveRoadmap: (state) => {
            state.activeRoadmap = null;
            state.nodes = [];
            state.edges = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserRoadmaps.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserRoadmaps.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchUserRoadmaps.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchRoadmapById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoadmapById.fulfilled, (state, action) => {
                state.loading = false;
                state.activeRoadmap = action.payload;
                state.nodes = action.payload.nodes || [];
                state.edges = action.payload.edges || [];
            })
            .addCase(fetchRoadmapById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(createRoadmap.fulfilled, (state, action) => {
                state.list.unshift(action.payload);
            })

            .addCase(saveRoadmapCanvas.pending, (state) => {
                state.saving = true;
            })
            .addCase(saveRoadmapCanvas.fulfilled, (state, action) => {
                state.saving = false;
                state.activeRoadmap = action.payload;
            })
            .addCase(saveRoadmapCanvas.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload;
            })

            .addCase(updateRoadmapMeta.fulfilled, (state, action) => {
                const idx = state.list.findIndex(r => r._id === action.payload._id);
                if (idx !== -1) state.list[idx] = action.payload;
                if (state.activeRoadmap?._id === action.payload._id) {
                    state.activeRoadmap = { ...state.activeRoadmap, ...action.payload };
                }
            })

            .addCase(deleteRoadmap.fulfilled, (state, action) => {
                state.list = state.list.filter(r => r._id !== action.payload);
                if (state.activeRoadmap?._id === action.payload) {
                    state.activeRoadmap = null;
                    state.nodes = [];
                    state.edges = [];
                }
            });
    },
});

export const { updateNodeData, setNodes, setEdges, clearActiveRoadmap } = roadmapSlice.actions;
export default roadmapSlice.reducer;