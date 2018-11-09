import * as express from "express";
import {ImageController} from "../controllers/image.controller";

export function setup(router: express.Router): express.Router {
  var imageController: ImageController = new ImageController();
  // Need to implement further
  router.get("/api/image", imageController.getImage);
  return router;
}
