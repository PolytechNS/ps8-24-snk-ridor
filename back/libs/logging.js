const { appendFile } = require('fs');

let log_level = process.env.LOG_LEVEL || 'info';

class Logger {
    levels = ['trace', 'debug', 'info', 'warn', 'error'];
    colors = {
        trace: '\x1b[37m',
        debug: '\x1b[36m',
        info: '\x1b[32m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
    };
    level;
    filename;

    constructor(level = 'info', filename = 'log.txt') {
        this.level = level;
        this.filename = filename;
    }

    trace(message) {
        this._log('trace', message);
    }

    debug(message) {
        this._log('debug', message);
    }

    info(message) {
        this._log('info', message);
    }

    warn(message) {
        this._log('warn', message);
    }

    error(message) {
        this._log('error', message);
    }

    _log(level, message) {
        if (this.levels.indexOf(level) >= this.levels.indexOf(this.level)) {
            let color = this.colors[level];
            console.log(`[${color}${level}\x1b[0m] ${message}`);

            appendFile(this.filename, `[${level}] ${message}\n`, (error) => {
                if (error) {
                    console.error(`Error writing to log file: ${error}`);
                }
            });
        }
    }
}

const logger = new Logger(log_level);

module.exports = { logger };
