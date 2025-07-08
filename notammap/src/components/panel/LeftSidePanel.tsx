import { ReactNode } from "react";
import { boxShadowStyle } from "../componentConstants";

export interface LeftSidePanelProps {
    children: ReactNode;
    height: string;
}

export function LeftSidePanel({ children, height }: LeftSidePanelProps) {
    return (
        <div className="p-1 bg-white rounded-md" style={boxShadowStyle}>
            {/* change position of scrollbar, padding of parent for spacing around scrollbar */}
            <div className="overflow-auto" style={{ direction: "rtl", height }}>
                <div className="p-4" style={{ direction: "initial" }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
