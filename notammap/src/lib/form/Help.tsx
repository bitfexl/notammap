import { useState } from "react";

/**
 * A inline help icon. Displays help (children) on hover.
 */
export function Help({ children }: any) {
    const [showHelp, setShowHelp] = useState(false);

    // TODO: support for mobile

    return (
        <span className="relative z-[99999] opacity-100" onPointerEnter={() => setShowHelp(true)} onPointerLeave={() => setShowHelp(false)}>
            <span className="select-none">(?)</span>
            {showHelp ? (
                <div className="absolute top-1 pb-4 left-1/2 -translate-x-1/2 -translate-y-full">
                    <div className="relative bg-white shadow-lg rounded-sm border border-gray-300 w-max">
                        <div className="w-4 h-4 absolute -bottom-2 left-1/2 -translate-x-1/2 rotate-45 bg-white border-gray-300 border-r border-b"></div>
                        <div className="p-2 relative">{children}</div>
                    </div>
                </div>
            ) : null}
        </span>
    );
}
