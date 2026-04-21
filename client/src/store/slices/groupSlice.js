import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const fetchGroups = createAsyncThunk(
    'groups/fetchAll',
    async () => {
        const response = await API.get('/groups');
        return response.data;
    }

);

export const createGroup = createAsyncThunk(
    'groups/create',
    async (groupData) => {
        const response = await API.post('/groups', groupData);
        return response.data;
    }
);

const groupSlice = createSlice({
    name: 'groups',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGroups.pending, (state) => { state.loading = true })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                state.list.push(action.payload);
            })
    }
});

export default groupSlice.reducer;