import express = require("express");
import { OauthController } from "../controllers/oauth.controller";
import { logger } from "../utils/logger";

export function setup(router: express.Router): express.Router {
  var controller: OauthController = new OauthController();

  router.post("/api/v1/login", controller.login);

  return router;
}
