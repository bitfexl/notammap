import { useEffect, useState } from "react";

export function useLocalStorage<S>(initialValue: S, key: string): [S, (val: S) => any] {
    const [value, setValue] = useState<S>(() => {
        let storedValue = localStorage.getItem(key) as any;

        if (storedValue == null) {
            return initialValue;
        }

        try {
            return JSON.parse(storedValue);
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value]);

    return [value, setValue];
}
