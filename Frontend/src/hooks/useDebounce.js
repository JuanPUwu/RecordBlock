import { useEffect, useState } from "react";

/**
 * Hook para debounce de valores
 * @param {*} value - Valor a debounce
 * @param {number} delay - Delay en milisegundos
 * @returns {*} Valor debounced
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

