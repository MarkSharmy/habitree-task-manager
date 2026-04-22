import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';
import roadmapReducer from './slices/roadmapSlice';
import statsReducer from './slices/statsSlice';
import groupReducer from './slices/groupSlice';
import plannerReducer from './slices/plannerSlice';
import sessionReducer from './slices/sessionSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tasks: taskReducer,
        stats: statsReducer,
        roadmap: roadmapReducer,
        groups: groupReducer,
        planner: plannerReducer,
        session: sessionReducer,
    },
    //Add middleware here...
});

