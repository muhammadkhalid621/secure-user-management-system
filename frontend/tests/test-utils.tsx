import React, { type PropsWithChildren, type ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { createAppStore, type RootState } from "@/store";

export const renderWithStore = (
  ui: ReactElement,
  options?: { preloadedState?: Partial<RootState> }
) => {
  const store = createAppStore(options?.preloadedState);

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper })
  };
};
