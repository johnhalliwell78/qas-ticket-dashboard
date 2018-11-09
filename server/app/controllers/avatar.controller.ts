import { logger } from "../utils/logger";
import { encodeBase64 } from "../utils/base64";
var request: any = require("request").defaults({ encoding: null });

export class AvatarController {
  public getAvatars(keyUrlList: { key: string, url: string }[]): Promise<{ key: string, avatar: string }[]> {
    let promises: any[] = [];
    for (let keyUrl of keyUrlList) {
      promises.push(this.getAvatar(keyUrl));
    }

    return Promise.all(promises);
  }

  public getAvatar(keyUrl: { key: string, url: string }): Promise<{ key: string, avatar: string }> {
    let userNameAndPassword: string = process.env.UNAME + ":" + process.env.PASS;
    userNameAndPassword = encodeBase64(userNameAndPassword);

    return new Promise<any>((resolve: any, reject: any) => {
      let options: any = {
        url: keyUrl.url,
        headers: {
          "Authorization": "Basic " + userNameAndPassword
        }
      };

      request(options, function (error: any, response: any, body: any): void {
        if (error) {
          reject(error);
        } else {
          let data: any = "data:" + response.headers["content-type"] + ";base64," + encodeBase64(body);
          resolve({ key: keyUrl.key, avatar: data });
        }
      });
    });
  }
}
