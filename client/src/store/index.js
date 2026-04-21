import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import roadmapReducer from './slices/roadmapSlice';
import statsReducer from './slices/statsSlice';
import groupReducer from './slices/groupSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tasks: taskReducer,
        stats: statsReducer,
        roadmap: roadmapReducer,
        groups: groupReducer,
    },
    //Add middleware here...
});

