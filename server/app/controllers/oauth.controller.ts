import express = require("express");
import { logger } from "../utils/logger";
import * as HttpStatus from "../models/httpStatus";
import * as errors from "../models/error";
import * as HeaderConstant from "../models/headerConst";
import { asyncHttpRequest } from "../utils/http-request";
/* 
  OauthController is currently not used 
  However, it may needed in the future 
  => This should be left here rather than delete it
*/
export class OauthController {
  public login(req: express.Request, res: express.Response): void {
    var contentType: string = HeaderConstant.HEADER_CONTENT_TYPE;
    try {
      
      res.sendStatus(HttpStatus.NOT_FOUND);
      return;
      /* The rest lines will not be executed if you do not remove 2 previous lines */
    //   logger.info("Start Jira authentication process");
    //   /* Use verifyJiraAccount as a wrapper of httpRequest since httpRequest cannot be called directly in this scope */
    //   let verifyJiraAccount: (username: string, password: string) => Promise<any>;
    //   verifyJiraAccount = function (username: string, password: string): Promise<any> {
    //     let req: Promise<any> = asyncHttpRequest(username, password, "POST", "", "");
    //     return req;
    //   };
    //   var username: string = req.body.username;
    //   var password: string = req.body.password;
    //   let result: Promise<any> = verifyJiraAccount(username, password);
    //   result.then((resultRes: any) => {
    //     if (typeof resultRes === "boolean") {
    //       if (resultRes) {
    //         //TODO: implement JWT and cresidential storing
    //         let jwt: any = {token: "haha.hihi.hehe"};
    //         res.status(HttpStatus.OK).header({
    //           contentType: "application/json"
    //         }).send(jwt);
    //         logger.info("Login Succeeded");
    //       } else {
    //         logger.info("Login Failed");
    //         res.status(HttpStatus.NOT_AUTHORIZED).send(new errors.NotAuthorized());
    //       }
    //     }
    // });     
    } catch (e) {
      logger.error("OauthController - login exception: ", e);
      res.status(HttpStatus.SERVER_ERROR).send(new errors.ServerError());
    }
  }
  

  

}
