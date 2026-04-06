import Logger from '../utils/Logger.js';
export default class Renderer {
    constructor(canvas, visualConfig) {
        this.canvas = canvas;

        this.ctx = this.canvas.getContext('2d');
        this.visualConfig = visualConfig;

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this._setupDefaults();
    }

    _setupDefaults() {
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
    }

    _roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }

    clear() {
        this.ctx.fillStyle = this.visualConfig.BACKGROUND_COLOR || '#0a0a0a';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawRect(x, y, width, height, color, options = {}) {
        const {
            fill = true,
            stroke = false,
            alpha = 1.0,
            borderRadius = 0,
            lineWidth = 1,
            strokeColor = color
        } = options;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;

        if (borderRadius > 0) {
            this._roundRect(x, y, width, height, borderRadius);
        } else {
            this.ctx.beginPath();
            this.ctx.rect(x, y, width, height);
        }

        if (fill) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }

        if (stroke) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = lineWidth;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawLine(x1, y1, x2, y2, color, width = 1, alpha = 1.0) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawText(text, x, y, options = {}) {
        const {
            font = '14px Arial',
            color = '#e8e8e8',
            align = 'left',
            baseline = 'middle',
            alpha = 1.0,
            shadow = false,
            maxWidth = null
        } = options;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.font = font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.textBaseline = baseline;

        if (shadow) {
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 2;
        }

        if (maxWidth) {
            this.ctx.fillText(text, x, y, maxWidth);
        } else {
            this.ctx.fillText(text, x, y);
        }

        this.ctx.restore();
    }

    drawCircle(x, y, radius, color, options = {}) {
        const {
            fill = true,
            stroke = false,
            alpha = 1.0,
            lineWidth = 1,
            strokeColor = color
        } = options;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (fill) {
            this.ctx.fillStyle = color;
            this.ctx.fill();
        }

        if (stroke) {
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = lineWidth;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawDashedLine(x1, y1, x2, y2, color, dashPattern = [5, 3], width = 1, alpha = 1.0) {
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.setLineDash(dashPattern);
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }

    drawImage(image, x, y, width = null, height = null) {
        if (width && height) {
            this.ctx.drawImage(image, x, y, width, height);
        } else {
            this.ctx.drawImage(image, x, y);
        }
    }

    drawGradient(x, y, width, height, colorStops, direction = 'horizontal') {
        this.ctx.save();

        let gradient;
        if (direction === 'horizontal') {
            gradient = this.ctx.createLinearGradient(x, y, x + width, y);
        } else {
            gradient = this.ctx.createLinearGradient(x, y, x, y + height);
        }

        colorStops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
        });

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
    }

    setAlpha(alpha) {
        this.ctx.globalAlpha = alpha;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width * this.pixelRatio;
        this.canvas.height = height * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        this._setupDefaults();
    }

    measureText(text, font = '14px Arial') {
        this.ctx.save();
        this.ctx.font = font;
        const width = this.ctx.measureText(text).width;
        this.ctx.restore();
        return width;
    }

    getContext() {
        return this.ctx;
    }

    
}