import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosInstance';



export const { setActiveDate } = plannerSlice.actions;
export default plannerSlice.reducer;