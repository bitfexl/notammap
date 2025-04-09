import { boxShadowStyle } from "../componentConstants";
import { SVGIcon } from "../icons/SVGIcon";

export interface IconButtonProps {
    svgIcon: string;
    onClick: () => void;
    connected?: "bottom" | "bottom-right" | "bottom-left" | "none";
}

// TODO: use this button also for map layer selection

export function IconButton({ svgIcon, onClick, connected = "none" }: IconButtonProps) {
    return (
        <button
            className={`nostyle inline-block rounded-t-md ${
                !connected.startsWith("bottom") && "rounded-b-md"
            } bg-white w-10 h-10 cursor-pointer z-10`}
            style={boxShadowStyle}
            onClick={onClick}
        >
            <div className="p-2">
                <SVGIcon svg={svgIcon}></SVGIcon>
            </div>
            <div className={`${connected != "none" && "pb-2"} bg-white`}></div>
            {connected.startsWith("bottom") && (
                <div
                    className="w-full h-[6px] bg-white"
                    style={
                        connected != "bottom-left"
                            ? {
                                  boxShadow: "5px 0 0px white",
                              }
                            : {}
                    }
                >
                    {connected != "bottom-right" && (
                        <div
                            className="h-full"
                            style={{
                                boxShadow: "-5px 0 0px white",
                            }}
                        ></div>
                    )}
                </div>
            )}
        </button>
    );
}
