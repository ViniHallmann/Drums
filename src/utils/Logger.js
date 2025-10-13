export default class Logger {
    constructor(enabled = true) {
        this.enabled = enabled;
    }
    
    info(message, ...args) {
        if (this.enabled) console.log(`ℹ️ ${message}`, ...args);
    }
    
    success(message, ...args) {
        if (this.enabled) console.log(`✅ ${message}`, ...args);
    }
    
    warn(message, ...args) {
        if (this.enabled) console.warn(`⚠️ ${message}`, ...args);
    }
    
    error(message, ...args) {
        console.error(`❌ ${message}`, ...args);
    }
    
    debug(message, ...args) {
        if (this.enabled) {
            console.log(`🐛 ${message}`, ...args);
        }
    }
}