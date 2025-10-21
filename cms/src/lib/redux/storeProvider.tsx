"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { store, persistor } from "@/lib/redux/store";
import { PersistGate } from "redux-persist/integration/react";

export default function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        {children}
      </PersistGate>
    </Provider>
  );
}
