"use client";

import { useEffect, useState } from "react";

export const useAsyncData = <T>(
  loader: () => Promise<T>,
  dependencies: readonly unknown[]
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextData = await loader();
      setData(nextData);
    } catch (reloadError) {
      setError(reloadError instanceof Error ? reloadError.message : "Unable to load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const nextData = await loader();

        if (!cancelled) {
          setData(nextData);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load data.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
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
    error,
    reload
  };
};
