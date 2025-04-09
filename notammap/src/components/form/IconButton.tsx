import { boxShadowStyle } from "../componentConstants";
import { SVGIcon } from "../icons/SVGIcon";

export interface IconButtonProps {
    svgIcon: string;
    onClick: () => void;
    connected?: "bottom" | "bottom-right" | "bottom-left" | "none";
}

export function IconButton({ svgIcon, onClick, connected = "none" }: IconButtonProps) {
    return (
        <div className="h-10 z-10">
            <button
                className={`nostyle inline-block rounded-t-md ${!connected.startsWith("bottom") && "rounded-b-md"} bg-white w-10 ${
                    connected == "none" ? "h-10" : "h-12"
                } cursor-pointer`}
                style={boxShadowStyle}
                onClick={onClick}
            >
                <div className="p-2">
                    <SVGIcon svg={svgIcon}></SVGIcon>
                </div>
                <div className="pb-2"></div>
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
        </div>
    );
}
