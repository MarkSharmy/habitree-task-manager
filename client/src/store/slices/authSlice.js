import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {

            const response = await API.post('/auth/login', credentials);
            localStorage.setItem('habitree_token', response.data.token);
            return res.data.user;

        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: !!localStorage.getItem('habitree_token'),
        loading: false,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('habitree_token');
            state.user = null;
            state.isAuthenticated = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
            });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;