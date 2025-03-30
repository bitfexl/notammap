import { boxShadowStyle } from "../componentConstants";
import { SVGIcon } from "../icons/SVGIcon";

export interface IconButtonProps {
    svgIcon: string;
    onClick: () => void;
}

export function IconButton({ svgIcon, onClick }: IconButtonProps) {
    return (
        <button className="nostyle inline-block rounded-md w-10 h-10 bg-white cursor-pointer" style={boxShadowStyle} onClick={onClick}>
            <div className="p-2">
                <SVGIcon svg={svgIcon}></SVGIcon>
            </div>
        </button>
    );
}
