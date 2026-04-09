"use client";

import { useEffect, useState } from "react";

export const useAsyncData = <T>(
  loader: () => Promise<T>,
  dependencies: readonly unknown[]
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = async () => {
    setIsLoading(true);
    const nextData = await loader();
    setData(nextData);
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      const nextData = await loader();

      if (!cancelled) {
        setData(nextData);
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return {
    data,
    setData,
    isLoading,
    reload
  };
};
