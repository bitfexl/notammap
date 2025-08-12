import * as L from "leaflet";

const defaultImgOptions = {
    size: [40, 40],
    offset: { x: 0, y: 0 },
};

// TODO: flyto sometimes not correctly updates the markers

// TODO: weird effect when hovering while zoomed out, possibly because of circle marker changing color

const CanvasMarker: any = L.CircleMarker.extend({
    _updatePath() {
        if (!this.options.img || !this.options.img.url) return;
        if (!this.options.img.el) {
            this.options.img = { ...defaultImgOptions, ...this.options.img };
            // TODO: cache loaded images
            const img = document.createElement("img");
            img.onload = () => {
                // autosize height if negative
                if (this.options.img.size[1] < 0) {
                    this.options.img.size[1] = img.height / (img.width / this.options.img.size[0]);
                }
                this.redraw();
            };
            img.onerror = () => {
                this.options.img = null;
            };
            img.src = this.options.img.url;
            this.options.img.el = img;
        } else {
            this._updateImg(this._renderer._ctx);
        }
    },

    _updateImg(ctx: CanvasRenderingContext2D) {
        const { img } = this.options;
        const p = this._point.round();
        p.x += img.offset.x;
        p.y += img.offset.y;
        ctx.drawImage(img.el, p.x - img.size[0] / 2, p.y - img.size[1] / 2, img.size[0], img.size[1]);
        // this._containsPoint(null, true, ctx);
    },

    _containsPoint(pc: L.Point, draw = false, ctx: CanvasRenderingContext2D) {
        const p = this._point.round();
        const { img } = this.options;
        if (!img) return false;
        p.x += img.offset.x;
        p.y += img.offset.y;
        const ct = this._clickTolerance();
        const wh = img.size[0] / 2;
        const hh = img.size[1] / 2;
        const minX = p.x - wh - ct;
        const maxX = p.x + wh + ct;
        const minY = p.y - hh - ct;
        const maxY = p.y + hh + ct;

        if (draw) {
            ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        } else {
            return pc.x >= minX && pc.x <= maxX && pc.y >= minY && pc.y <= maxY;
        }
    },
});

interface CanvasMarkerOptions extends L.PathOptions {
    img: {
        size?: [number, number];
        offset?: { x: number; y: number };
        url: string;
    };
}

export function canvasMarker(latLng: L.LatLngExpression, options: CanvasMarkerOptions): L.Layer {
    return new CanvasMarker(latLng, options);
}
