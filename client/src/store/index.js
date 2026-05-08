import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import roadmapReducer from './slices/roadmapSlice';
import statsReducer from './slices/statsSlice';
import groupReducer from './slices/groupSlice';
import plannerReducer from './slices/plannerSlice';
import sessionReducer from './slices/sessionSlice';
import projectReducer from './slices/projectSlice';
import userReducer from './slices/userSlice';
import analyticsReducer from './slices/analyticsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        tasks: taskReducer,
        stats: statsReducer,
        analytics: analyticsReducer,
        roadmaps: roadmapReducer,
        groups: groupReducer,
        planner: plannerReducer,
        session: sessionReducer,
        projects: projectReducer,
    },
});