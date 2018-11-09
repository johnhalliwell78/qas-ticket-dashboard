import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

/**
 * ensure only authorized user can access our application
 * @param req the Request
 * @param res the Response
 * @param next the NextFunction
 */
export function auth(req: Request, res: Response, next: NextFunction): void {
  let ignoredPaths: Array<string> = [
    "/api/v1/login",
    "/api/health-check",
    "/api/tickets",
    "/api/image"
  ];

  var ignoredAuthorize: boolean = false;
  ignoredPaths.forEach((path: string) => {
    if (req.path.startsWith(path)) {
      ignoredAuthorize = true;
      return;
    }
  });

  if (ignoredAuthorize) {
    logger.info(`req.path: ${req.path} is ignored, calling next()`);
    return next();
  }

  // TODO: authenticate the request
}
