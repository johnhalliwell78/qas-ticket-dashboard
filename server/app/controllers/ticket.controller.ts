import express = require("express");
import { logger } from "../utils/logger";
import * as HttpStatus from "../models/httpStatus";
import * as errors from "../models/error";
import { asyncHttpRequest } from "../utils/http-request";
import { AvatarController } from "./avatar.controller";

export class TicketController {
  public getTickets(req: express.Request, res: express.Response, next: express.NextFunction): void {
    let endPoint: string = `/rest/agile/1.0/board/${process.env.BOARDID}/issue?fields=assignee,created,updated,status,resolution,project&jql=status!=done&maxResults=1000`;
    let resData: any;
    let keyUrlList: { key: string, url: string }[] = [];
    asyncHttpRequest(process.env.UNAME, process.env.PASS, "GET", endPoint, null)
      .then((data: any) => {
        resData = data;
        for (let issue of data.issues) {
          if (issue.fields.assignee) {
            let url: string = issue.fields.assignee.avatarUrls["48x48"];
            let key: string = issue.fields.assignee.key;

            let existed: boolean = false;
            for (let i: number = 0; i < keyUrlList.length; i++) {
              if (keyUrlList[i].key === key) {
                existed = true;
                break;
              }
            }

            if (!existed) {
              keyUrlList.push({ key, url });
            }
          }
        }

        let avatarController: AvatarController = new AvatarController();
        return avatarController.getAvatars(keyUrlList);
      })
      .then((keyAvatarList: { key: string, avatar: string }[]) => {
        for (let issue of resData.issues) {
          if (issue.fields.assignee) {
            let key: string = issue.fields.assignee.key;
            for (let i: number = 0; i < keyAvatarList.length; i++) {
              if (keyAvatarList[i].key === key) {
                issue.fields.assignee.avatar = keyAvatarList[i].avatar;
                break;
              }
            }
          }
        }

        res.status(HttpStatus.OK).header({
          contentType: "application/json"
        }).send(resData);
      })
      .catch((error: any) => {
        logger.error("TicketController - getTickets error: ", error);
        res.status(HttpStatus.BAD_REQUEST).send(new errors.BadRequest());
      });
  }
}
