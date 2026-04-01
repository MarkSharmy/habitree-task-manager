import { configureStore } from '@reduxjs/toolkit';
import taskReducer from './slices/taskSlice';
import sessionReducer from './slices/sessionSlice';
import roadmapReducer from './slices/roadmapSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tasks: taskReducer,
        session: sessionReducer,
        roadmap: roadmapReducer,
    },
    //Add middleware here...
});

