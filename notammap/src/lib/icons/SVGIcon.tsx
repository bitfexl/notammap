import "./SVGIcon.css";

export interface SVGIconProps {
    /**
     * The svg contents as a string. Will be set as html.
     */
    svg: string;

    /**
     * Whether the icons should be inline or not
     */
    inline?: boolean;
}

export function SVGIcon({ svg, inline = false }: SVGIconProps) {
    const classes = inline ? "inline-block align-bottom" : "svg-icon-full";
    return <span dangerouslySetInnerHTML={{ __html: svg }} className={classes}></span>;
}
