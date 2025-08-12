"use strict";

import * as L from "leaflet";

const defaultImgOptions = {
    rotate: 0,
    size: [40, 40],
    offset: { x: 0, y: 0 },
};

const CanvasMarker = L.CircleMarker.extend({
    _updatePath() {
        if (!this.options.img || !this.options.img.url) return;
        if (!this.options.img.el) {
            this.options.img = { ...defaultImgOptions, ...this.options.img };
            const img = document.createElement("img");
            img.src = this.options.img.url;
            this.options.img.el = img;
            img.onload = () => {
                this.redraw();
            };
            img.onerror = () => {
                this.options.img = null;
            };
        } else {
            this._updateImg(this._renderer._ctx);
        }
    },

    _updateImg(ctx) {
        const { img } = this.options;
        const p = this._point.round();
        p.x += img.offset.x;
        p.y += img.offset.y;
        ctx.drawImage(img.el, p.x - img.size[0] / 2, p.y - img.size[1] / 2, img.size[0], img.size[1]);
        // this._containsPoint(null, true, ctx);
    },

    _containsPoint(pc, draw = false, ctx) {
        const p = this._point.round();
        const { img } = this.options;
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

L.canvasMarker = function (...opt) {
    // try {
    //     const i = opt.findIndex((o) => typeof o === "object" && o.img);
    //     if (i + 1) {
    //         if (!opt[i].radius && opt[i].img && opt[i].img.size) opt[i].radius = Math.ceil(Math.max(...opt[i].img.size) / 2);
    //         if (opt[i].pane) delete opt[i].pane;
    //     }
    // } catch (e) {}
    return new CanvasMarker(...opt);
};
