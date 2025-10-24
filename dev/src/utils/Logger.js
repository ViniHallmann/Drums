class Logger {
    constructor() {
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
        
        this.currentLevel = this.levels.INFO;
        this.enableConsole = true;
        this.enableTimestamp = true;
    }

    setLevel(level) {
        if (this.levels[level] !== undefined) {
            this.currentLevel = this.levels[level];
        }
    }

    _log(level, message, ...args) {
        if (this.levels[level] < this.currentLevel || !this.enableConsole) {
            return;
        }

        const timestamp = this.enableTimestamp 
            ? `[${new Date().toISOString().split('T')[1].split('.')[0]}]` 
            : '';
        
        const prefix = `${timestamp}[${level}]`;
        
        const styles = {
            DEBUG: 'color: #888',
            INFO: 'color: #4CAF50',
            WARN: 'color: #FF9800',
            ERROR: 'color: #F44336; font-weight: bold'
        };

        console.log(`%c${prefix}`, styles[level], message, ...args);
    }

    debug(message, ...args) {
        this._log('DEBUG', message, ...args);
    }

    info(message, ...args) {
        this._log('INFO', message, ...args);
    }

    warn(message, ...args) {
        this._log('WARN', message, ...args);
    }

    error(message, ...args) {
        this._log('ERROR', message, ...args);
    }
}

const logger = new Logger();
Object.freeze(logger);

export default logger;