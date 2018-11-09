import * as express from "express";
import * as HttpStatus from "../models/httpStatus";
import { TicketController } from "../controllers/ticket.controller";

export function setup(router: express.Router): express.Router {
  var ticketController: TicketController = new TicketController();
  // Need to implement further
  router.get("/api/tickets", ticketController.getTickets);

  return router;
}
