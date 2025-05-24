"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const logger = new logger_1.Logger("app");
app.listen(8090, () => {
    logger.info("Server started on port 8090");
});
