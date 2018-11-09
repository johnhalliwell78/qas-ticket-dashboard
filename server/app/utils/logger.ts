import { Request } from "express";
import * as winston from "winston";
import * as env from "../models/env";
import * as headerConst from "../models/headerConst";
require("winston-daily-rotate-file");

const tsFormat: any = () => (new Date()).toLocaleTimeString();
const fs: any = require("fs");
const path: any = require("path");
let isOnDemand: boolean = require("../../app.config.json").on_demand;

const appLogDir: any = path.join(process.cwd(), "logs");
if (!fs.existsSync(appLogDir)) {
  fs.mkdirSync(appLogDir);
}

// log file path, notice the "-" char since we are going to use daily rotate log file
const logFilePath: any = path.join(appLogDir, "-logs.log");

// reference:
//  * log levels: { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
//  * for more information about log levels, check out the document at: https://github.com/winstonjs/winston
let logLevel: string = "silly"; // default is "silly" for LOCAL env.
if (process.env.NODE_ENV === env.PRODUCTION) {
  logLevel = "warn";
} else if (process.env.NODE_ENV === env.DEVELOPMENT) {
  logLevel = "info";
}

// create logger with empty transports, we'll add transports later
let winstonLogger: any = new winston.Logger({
  exitOnError: false
});

// detect NODE_ENV then add relevant log transport
if (process.env.NODE_ENV === env.LOCAL) {
  winstonLogger.configure({
    transports: [
      new (winston.transports.Console)(
      {
        level: logLevel, // logs everything to the console
        json: false,
        colorize: true,
        timestamp: tsFormat,
        handleExceptions: true,
        prettyPrint: true
      })
    ]
  });
} else {
  winstonLogger.configure({
    transports: [
      new (winston.transports.DailyRotateFile)(
      {
        filename: logFilePath,
        timestamp: tsFormat,
        datePattern: "yyyy-MM-dd",
        prepend: true,
        handleExceptions: true,
        json: false,
        level: logLevel,
        colorize: false,
        maxFiles: 30
      })
    ]
  });
}

export const logger: any = winstonLogger;
export const logStream: any = {
  write: (text: string) => {
    logger.info(text);
  }
};

export class LoggerUtils {
  public static logRequestInfo(req: Request, message: string): void {
    let reqPath: string = req.protocol + "://" + req.get("host") + req.path;
    logger.error(
      `${message}
      Request path: ${reqPath}
      Client name: ${req.headers[headerConst.HEADER_CLIENT_NAME]}
      `);
  }
}
