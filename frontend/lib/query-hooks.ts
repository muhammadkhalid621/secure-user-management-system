"use client";

import { useEffect, useRef, useState } from "react";

export const useAsyncData = <T>(
  loader: () => Promise<T>,
  dependencies: readonly unknown[]
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const reload = async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const nextData = await loader();

      if (requestId === requestIdRef.current) {
        setData(nextData);
      }
    } catch (reloadError) {
      if (requestId === requestIdRef.current) {
        setError(reloadError instanceof Error ? reloadError.message : "Unable to load data.");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextData = await loader();

        if (requestId === requestIdRef.current) {
          setData(nextData);
        }
      } catch (loadError) {
        if (requestId === requestIdRef.current) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load data.");
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    })();
  }, dependencies);

  return {
    data,
    setData,
    isLoading,
    isRefreshing: isLoading && data !== null,
    error,
    reload
  };
};
