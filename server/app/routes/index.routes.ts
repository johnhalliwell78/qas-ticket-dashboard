import * as express from "express";
import * as HttpStatus from "../models/httpStatus";

export function setup(router: express.Router): express.Router {
  router.get("/api/health-check", (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    res.sendStatus(HttpStatus.OK);
  });

  return router;
}
