import { configureStore } from "@reduxjs/toolkit";
import templatesSlice from './features/templateSlice' //importing slice 

import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import thunk from "redux-thunk";

const persistConfig = {
  key: "root",
  storage,
};


const mypersistReducer = persistReducer(persistConfig, templatesSlice);

export const store = configureStore({
  reducer: mypersistReducer,
  middleware: [thunk],
});

export default store;
export const persistor = persistStore(store);