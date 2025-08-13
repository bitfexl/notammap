import * as L from "leaflet";

const defaultImgOptions = {
    size: [40, 40],
    offset: { x: 0, y: 0 },
};

// TODO: flyto sometimes not correctly updates the markers

// TODO: optimize lag (flags)

const CanvasMarker: any = L.CircleMarker.extend({
    _updatePath() {
        if (!this.options.img || !this.options.img.url) return;
        if (!this.options.img.el) {
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
        const p = this._point;
        ctx.drawImage(img.el, p.x - img.size[0] / 2, p.y - img.size[1] / 2, img.size[0], img.size[1]);
        // this._containsPoint(null, true, ctx);
    },

    _containsPoint(pc: L.Point, draw = false, ctx: CanvasRenderingContext2D) {
        const p = this._point.round();
        const { img } = this.options;
        if (!img) return false;
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

    _project() {
        const { img } = this.options;
        if (!img) return;
        this._point = this._map.latLngToLayerPoint(this._latlng);
        this._point.x += img.offset.x;
        this._point.y += img.offset.y;
        this._updateBounds();
    },

    _updateBounds() {
        const { img } = this.options;
        if (!img) return;
        const p = this._point;
        const pOffset = img.halfSize;
        this._pxBounds = new L.Bounds(p.subtract(pOffset), p.add(pOffset));
    },

    _empty() {
        return !this._renderer._bounds.intersects(this._pxBounds);
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
    (options.img as any) = { ...defaultImgOptions, ...options.img };
    (options.img as any) = {
        ...options.img,
        halfSize: [
            (options.img as any).size[0] / 2,
            (options.img as any).size[1] < 0 ? (options.img as any).size[0] * 2 : (options.img as any).size[1] / 2,
        ],
    };
    return new CanvasMarker(latLng, options);
}
