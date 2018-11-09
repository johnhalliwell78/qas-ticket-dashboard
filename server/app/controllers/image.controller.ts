import express = require("express");
import {logger} from "../utils/logger";
import * as HttpStatus from "../models/httpStatus";
import * as errors from "../models/error";
import * as HeaderConstant from "../models/headerConst";
import {asyncHttpRequest} from "../utils/http-request";


/**
 * Get a hero.
 * @param req {Request} The express request object.
 * @param res {Response} The express response object.
 * @param next {NextFunction} The next function to continue.
 */
export class ImageController {
  public getImage(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const PARAM_ID: string = "name";
    const path: any = require("path");
    // if (req.params[PARAM_ID] === undefined) {
    //   res.sendStatus(404);
    //   next();
    //   return;
    // }

    const name: string = req.params[PARAM_ID];
    // res.sendFile(path.resolve(__dirname, "../../public/images/captain-america.jpg"), next);
    let getImageFromJira: (path: string) => Promise<any>;
    getImageFromJira = function (path: string): Promise<any> {
      let req: Promise<any> = asyncHttpRequest(process.env.UNAME, process.env.PASS, "GET", path, null);
      return req;
    };
    // Need to implement further
    let result: any = getImageFromJira("/secure/useravatar?ownerId=duongnapham&avatarId=10416");
    result.then((resultRes: any) => {
      
      res.status(HttpStatus.OK).header({
        "Content-Type": "image/png"
      }).send(resultRes);
    });

    return;

  }
}
