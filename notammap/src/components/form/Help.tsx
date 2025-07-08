import { useRef, useState } from "react";
import { BodyContent } from "../BodyContent";

/**
 * A inline help icon. Displays help (children) on hover.
 */
export function Help({ children }: any) {
    const [showHelp, setShowHelp] = useState(false);
    const icon = useRef<HTMLElement | null>(null);

    // TODO: support for mobile

    function getPosition() {
        const bounds = icon.current!.getBoundingClientRect();
        return {
            top: bounds.top,
            left: bounds.left + bounds.width / 2,
        };
    }

    return (
        <span className="relative" onPointerEnter={() => setShowHelp(true)} onPointerLeave={() => setShowHelp(false)}>
            <span className="select-none" ref={icon}>
                (?)
            </span>
            {showHelp ? (
                <BodyContent>
                    <div className="fixed z-[9999] -translate-x-1/2 -translate-y-full pb-4" style={getPosition()}>
                        <div className="relative bg-white shadow-lg rounded-sm border border-gray-300 w-max">
                            <div className="w-4 h-4 absolute -bottom-2 left-1/2 -translate-x-1/2 rotate-45 bg-white border-gray-300 border-r border-b"></div>
                            <div className="p-2 relative">{children}</div>
                        </div>
                    </div>
                </BodyContent>
            ) : null}
        </span>
    );
}
