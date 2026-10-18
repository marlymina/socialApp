import { createContext, useContext, useState, type ReactNode } from "react";

const CounterContext = createContext({ count: 0, setCount: (_value: number) => {} });

export function CounterProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  return <CounterContext.Provider value={{ count, setCount }}>{children}</CounterContext.Provider>;
}

export function useCounter() {
  return useContext(CounterContext);
}
