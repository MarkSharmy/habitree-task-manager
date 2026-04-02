import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const fetchRoadmap = createAsyncThunk(
    'roadmap/fetch',
    async (id) => {
        const response = await API.get(`/api/roadmaps/${id}`);
        return response.data.roadmap;
    }
);

const roadmapSlice = createSlice({
    name: 'roadmap',
    initialState: {
        activeRoadmap: null,
        nodes: [],
        edges: [],
        loading: false,
    },
    reducers: {
        // Important: Updates the "Glow" or progress of a node when a task is updated
        updateNodeData: (state, action) => {
            const { nodeId, progress, status } = action.payload;
            const node = state.nodes.find(n=> n.id === nodeId);
            if (node) {
                node.data = { ...node.data, progress, status };
            }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchRoadmap.fulfilled, (state, action) => {
            const roadmap = action.payload;
            state.activeRoadmap = roadmap;
            state.nodes = roadmap.nodes;
            state.edges = roadmap.edges;
        });
    }
});

export const { updateNodeData } = roadmapSlice.actions;
export default roadmapSlice.reducer;