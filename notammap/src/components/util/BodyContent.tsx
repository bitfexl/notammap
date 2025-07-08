import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface BodyContentProps {
    children: ReactNode;
}

export function BodyContent({ children }: BodyContentProps) {
    const [div, setDiv] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const div = document.createElement("div");
        document.body.append(div);
        setDiv(div);
        return () => div.remove();
    }, []);

    return div ? createPortal(children, div) : null;
}
