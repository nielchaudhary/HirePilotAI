"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.globalLogger = void 0;
const debug_1 = __importDefault(require("debug"));
//logger
const globalContext = "ninja";
exports.globalLogger = (0, debug_1.default)(globalContext);
class Logger {
    constructor(loggingContext) {
        this.info = (arg, ...args) => {
            this.logInfo(arg, ...args);
        };
        this.error = (arg, ...args) => {
            this.logError(arg, ...args);
        };
        this.logInfo = exports.globalLogger.extend(loggingContext + " [INFO]");
        this.logError = exports.globalLogger.extend(loggingContext + "[ERROR]");
        this.logInfo.log = this.log.bind(this);
        this.logError.log = this.log.bind(this);
        Logger.loggers[loggingContext] = this;
    }
    log(message, ...args) {
        const logger = Logger.loggers["global"] || console;
        logger.info(message, ...args);
    }
}
exports.Logger = Logger;
Logger.loggers = {};
