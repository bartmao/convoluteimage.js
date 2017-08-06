(function () {
    'use strict';
    var convolute = {};

    convolute.custom = function (img, weights, options) {
        var canvas = document.createElement('canvas');
        var o = Object.assign(
            {
                offsetX: 0,
                offsetY: 0,
                width: img.width,
                height: img.height,
                callback: function noop(canvas){}
            }
            , options ? options : {});
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        var orignImg = ctx.getImageData(o.offsetX, o.offsetY, o.width, o.height);
        var newImg = ctx.createImageData(o.width, o.height);
        _convolute();
        ctx.putImageData(newImg, o.offsetX, o.offsetY);
        o.callback(canvas);
        canvas.toBlob(blob => {
            img.src = URL.createObjectURL(blob);
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                canvas.remove();
            };
        });

        function _convolute() {
            var side = Math.sqrt(weights.length);
            var halfSide = Math.floor(side / 2);
            var src = orignImg.data;
            var dst = newImg.data;
            var w = orignImg.width;
            var h = orignImg.height;
            for (var hi = 0; hi < h; ++hi) {
                for (var wi = 0; wi < w; ++wi) {
                    var pOffset = (hi * w + wi) * 4;
                    var r = 0, g = 0, b = 0;
                    for (var wy = 0; wy < side; ++wy) {
                        for (var wx = 0; wx < side; ++wx) {
                            var wOffset = wy * side + wx;
                            var hii = Math.min(h - 1, Math.max(0, hi - halfSide + wy));
                            var wii = Math.min(w - 1, Math.max(0, wi - halfSide + wx));
                            var pOffset_1 = (hii * w + wii) * 4;
                            r += src[pOffset_1] * weights[wOffset];
                            g += src[pOffset_1 + 1] * weights[wOffset];
                            b += src[pOffset_1 + 2] * weights[wOffset];
                        }
                    }
                    dst[pOffset] = r;
                    dst[pOffset + 1] = g;
                    dst[pOffset + 2] = b;
                    dst[pOffset + 3] = 255;
                }
            }
        }

    }

    convolute.blur = function (img, dimension, options) {
        var core = new Array(dimension * dimension);
        for (var i = 0; i < core.length; i += dimension) {
            var mid = Math.floor(i + dimension / 2);
            var offset = Math.floor(dimension / 2) - Math.abs(Math.floor(i / dimension) - Math.floor(dimension / 2));
            var lo = mid - offset;
            var hi = mid + offset;
            for (var j = i; j < i + dimension; j++) {
                if (j < lo || j > hi) core[j] = 0;
                else core[j] = 1;
            }
        }
        core = core.map(w => w / Math.ceil(dimension * dimension / 2));

        convolute.custom(img, core, options);
    }

    if (window) window.convolute = convolute;
})();
