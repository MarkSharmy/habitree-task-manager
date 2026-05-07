import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const fetchCurrentUser = createAsyncThunk(
    'user/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/users/me');
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'user/updateUserProfile',
    async (updates, { rejectWithValue }) => {
        try {
            const { data } = await API.put('/users/me', updates);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
        }
    }
);

export const updateUserSettings = createAsyncThunk(
    'user/updateUserSettings',
    async (settings, { rejectWithValue }) => {
        try {
            const { data } = await API.patch('/users/settings', settings);
            return data.settings;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update settings');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState: {
        profile: null,
        loading: false,
        updating: false,
        error: null,
        updateSuccess: false,
    },
    reducers: {
        clearUpdateStatus(state) {
            state.updateSuccess = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateUserProfile.pending, (state) => {
                state.updating = true;
                state.updateSuccess = false;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.updating = false;
                state.profile = action.payload;
                state.updateSuccess = true;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            })

            .addCase(updateUserSettings.fulfilled, (state, action) => {
                if (state.profile) {
                    state.profile.settings = action.payload;
                }
            });
    },
});

export const { clearUpdateStatus } = userSlice.actions;
export default userSlice.reducer;