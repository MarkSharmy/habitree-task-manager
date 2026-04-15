import { createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';
import { fetchTodayStats } from './statsSlice';

export const saveWorkSession = createAsyncThunk(
    'sessions/save',
    async (sessionData, { dispatch }) => {
        const response = await API.post('/sessions/save', sessionData);
        dispatch(fetchTodayStats());
        return response.data;
    }
);