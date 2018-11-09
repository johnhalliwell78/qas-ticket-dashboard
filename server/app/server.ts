import express = require("express");
import bodyParser = require("body-parser");
import * as cookieParser from "cookie-parser";
import cors = require("cors");
import path = require("path");
import * as mogan from "morgan";
import { NextFunction, Request, Response } from "express";
import * as favicon from "serve-favicon";
import * as fileUtils from "./utils/file";

import { logger, logStream } from "./utils/logger";
import { auth } from "./middlewares/auth";
import * as errors from "./models/error";
var app: express.Application = express();
var envPath: string = path.join(__dirname, "/../config.env");
const result: any = require("dotenv").config({ path: envPath }); // Add node environment variables before running the server
if (result.error) {
  logger.info(result.error);
  throw result.error;
}

// mount logger middleware
app.use(mogan("dev", { stream: logStream }));

var router: express.Router = express.Router();

// tslint:disable-next-line:typedef
// var allowCrossDomain = function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
//   if ("OPTIONS" === req.method) {
//     res.send(200);
//   } else {
//     next();
//   }
// };

// app.use(allowCrossDomain);

// for system.js to work. Can be removed if bundling.
// app.use(express.static(path.join(process.cwd(), "node_modules")));
app.use(bodyParser.json()); // To support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // To support URL-encoded bodies
  extended: true
}));

// for cookie parser
app.use(cookieParser());

app.use(cors());

// setup view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


// why use this module as middleware? read this: https://github.com/expressjs/serve-favicon
app.use(favicon(path.join(__dirname, "client", "assets", "icon", "favicon.ico")));

var clientPath: string = path.join(__dirname, "client");
app.use(express.static(clientPath));

// add auth middleware
router.use(auth);

// init all routers inside routes dir
var routePaths: Array<string> = fileUtils.getFilesSync(path.join(__dirname, "routes"), true);
routePaths.forEach((routePath: string) => {
  var route: any = require(routePath);
  if (route.setup !== undefined) {
    route.setup(router);
  }
});
app.use(router);

app.all("/*", (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") {
    res.status(200);
    res.end();
  } else {
    next();
  }
});

// catch 404 and forward to error handler
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  next({ status: 404, message: "Endpoint not found." });
});

// error handler no stacktrace leaked to user
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  var status: number = 500;
  var error: errors.HttpError;
  if (err instanceof errors.HttpError) {
    error = <errors.HttpError>err;
    status = error.status;
  } else if (err instanceof errors.InputIncorrect) {
    logger.error(`Input error ${req.path}`, err);
    error = new errors.BadRequest(err.message);
  } else {
    logger.error(`Error 500 for request ${req.path}`, err);
    error = new errors.ServerError(err.message);
  }

  res.status(status);

  if (req.accepts("html")) {
    res.render("error", { error: error });
  } else {
    res.json(error);
  }
});

export { app };
