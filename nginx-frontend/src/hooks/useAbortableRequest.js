import { useEffect, useRef } from "react";

export const useAbortableRequest = () => {
  const controllerRef = useRef(null);

  if (!controllerRef.current) {
    controllerRef.current = new AbortController();
  }

  useEffect(() => {
    const controller = controllerRef.current;
    return () => {
      controller.abort();
    };
  }, []);

  return controllerRef.current;
};
