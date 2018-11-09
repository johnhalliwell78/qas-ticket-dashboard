import {logger} from "../utils/logger";
import * as HeaderConstant from "../models/headerConst";
import {encodeBase64} from "./base64";
import * as HttpStatus from "../models/httpStatus";

/**
 * Use node-fetch module for making http(s) requests ASYNCHRONOUS
 * Reason for using node-fetch could be found at:
 * https://codeburst.io/4-ways-for-making-http-s-requests-with-node-js-c524f999942d
 */
import fetch from "node-fetch";

const contentType: string = HeaderConstant.HEADER_CONTENT_TYPE;
var headerOptions: any = {
  contentType: "application/json"
};
var imageHeaderOptions: any = {
  // "Content-Type": "image/png"
  contentType: "application/json"
};

/**
 * simple wrapper of ASYNCHRONOUS http request function
 * @param username the Username of Jira account
 * @param password the Password of Jira account
 * @param method the HTTP Method
 * @param path the Path of URL
 * @param body the Body of HTTP Request
 */
export function asyncHttpRequest(username: string, password: string, method: string, path: string, body: string): Promise<any> {
  let url: string = process.env.HOSTNAME + path;
  let options: any;
  if (!headerOptions.Cookie) {
    options = composeHttpOptionsWithAccount(username, password, method, body);

  } else {
    options = composeHttpOptionsWithToken(method, body);
  }
  return fetch(url, options).then((response: Response) => {
    if (method === "POST") {
      if (response.status === HttpStatus.OK) {
        return true;
      } else {    // Need to implement further
        return false;
      }
    } else {
      if (response.status < HttpStatus.BAD_REQUEST && !headerOptions.Cookie) {    // Send request to Jira by account succeeded
        let cookie: string = response.headers.get("set-cookie");
        if (cookie) {
          delete headerOptions.Authorization;
          headerOptions.Cookie = cookie;
        }
      } else if (response.status >= HttpStatus.BAD_REQUEST && headerOptions.Cookie) { // Send request to Jira by cookie failed
        delete headerOptions.Cookie;
      }
      return response.json();
    }
  }).catch((error: any) => {
    logger.info(error);
    return error;
  });
}

export function composeHttpOptionsWithAccount(username: string, password: string, method: string, body: string): any {
  let userNameAndPassword: string = username + ":" + password;
  userNameAndPassword = encodeBase64(userNameAndPassword);
  headerOptions.Authorization = "Basic " + userNameAndPassword;
  let options: any = {};
  options = {
    method: method,
    body: body,
    headers: headerOptions,
  };
  return options;
}

export function composeHttpOptionsWithToken(method: string, body: string): any {
  let options: any = {};
  options = {
    method: method,
    body: body,
    headers: headerOptions,
  };
  return options;
}
