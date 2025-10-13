import Logger from '../utils/Logger.js';
class Renderer {
    constructor(canvasId, visualConfig) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas com id "${canvasId}" não encontrado`);
        }

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

    setAlpha(alpha) {
        this.ctx.globalAlpha = alpha;
    }

    save() {
        this.ctx.save();
    }

    restore() {
        this.ctx.restore();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width * this.pixelRatio;
        this.canvas.height = height * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
        this._setupDefaults();
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

    measureText(text, font = '14px Arial') {
        this.ctx.save();
        this.ctx.font = font;
        const width = this.ctx.measureText(text).width;
        this.ctx.restore();
        return width;
    }

    drawImage(image, x, y, width = null, height = null) {
        if (width && height) {
            this.ctx.drawImage(image, x, y, width, height);
        } else {
            this.ctx.drawImage(image, x, y);
        }
    }

    getContext() {
        return this.ctx;
    }

    rotate(angle, centerX = 0, centerY = 0) {
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(angle);
        this.ctx.translate(-centerX, -centerY);
    }

    drawDebugGrid(spacing = 50, color = '#2a2a2a') {
        // Linhas verticais
        for (let x = 0; x <= this.width; x += spacing) {
            this.drawLine(x, 0, x, this.height, color, 0.5, 0.3);
        }

        // Linhas horizontais
        for (let y = 0; y <= this.height; y += spacing) {
            this.drawLine(0, y, this.width, y, color, 0.5, 0.3);
        }

        // Números nas linhas (a cada 100px)
        if (spacing >= 50) {
            for (let x = 0; x <= this.width; x += 100) {
                this.drawText(`${x}`, x + 2, 10, { 
                    font: '10px monospace', 
                    color: '#666',
                    alpha: 0.5 
                });
            }
            for (let y = 0; y <= this.height; y += 100) {
                if (y === 0) continue;
                this.drawText(`${y}`, 5, y + 2, { 
                    font: '10px monospace', 
                    color: '#666',
                    alpha: 0.5 
                });
            }
        }
    }

}

export default Renderer;