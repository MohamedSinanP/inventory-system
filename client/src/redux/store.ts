import { configureStore, combineReducers } from "@reduxjs/toolkit";
import type { Reducer, UnknownAction } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, createTransform } from 'redux-persist';
import type { PersistConfig } from 'redux-persist';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import type { Auth } from '../types/type';

interface RootState {
  auth: Auth;
}

type PersistedState = Partial<RootState>;

const authTransform = createTransform<Auth, Partial<Auth>>(
  // on save: persist only user object
  (inboundState: Auth) => {
    return { user: inboundState.user };
  },
  (outboundState: Partial<Auth>) => {
    return {
      ...outboundState,
      user: outboundState.user ?? null,
      accessToken: null,
    } as Auth;
  },
  { whitelist: ['auth'] }
);

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  version: 1,
  storage,
  transforms: [authTransform],
};

// Define the root reducer with proper typing
const rootReducer: Reducer<RootState, UnknownAction, PersistedState> = combineReducers({
  auth: authReducer,
});

const persistedReducer = persistReducer<RootState, UnknownAction>(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootStateType = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;