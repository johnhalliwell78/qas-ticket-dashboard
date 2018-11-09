import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Ticket } from "../models";
import { catchError, map, tap } from "rxjs/operators";
import { ErrorHandlingService } from "./errorhanlding.service"; // Used for error handling
import { TimeUtil } from "../shared/utilities/index";
import { environment } from "../../environments/environment";

@Injectable()
export class TicketService {
  // private issuesUrl = "https://agile.qasymphony.com/rest/agile/1.0/board/148/issue";
  // private detailUrl = "https://agile.qasymphony.com/rest/agile/1.0/issue/PRM-45";
  // private ticketUrl = "https://localhost:3000/api/tickets";
  // private temp = "https://localhost:3000/api/image";

  constructor(private http: HttpClient,
    private errorhandlingService: ErrorHandlingService) {
  }

  getImage(): Observable<Blob> {
    return this.http
      .get("/api/image", {
        responseType: "blob"
      });
  }

  getKeys(): Observable<Ticket[]> {
    const headerOptions = {
      "Content-Type": "application/json"
    };
    const httpOptions = {
      headers: new HttpHeaders(headerOptions)
    };
    let tickets: any;
    do {
      tickets = this.http.get<Ticket[]>("/api/tickets", httpOptions).pipe(
        map((res: any) => {
          if (!res.issues) {
            return undefined;
          }
          return this.parseTickets(res);
        }),
        catchError(this.errorhandlingService.handleError("getTickets", [] as Ticket[]))
      );
    } while (!tickets);
    return tickets;
  }

  private parseTickets(res: any): Ticket[] {  // Parsing the response
    const tickets: Ticket[] = [];
    for (let i = 0; i < res.issues.length; i++) {
      const ticket = new Ticket();
      ticket.key = res.issues[i].key;

      if (res.issues[i].fields.assignee) {
        ticket.assignee = res.issues[i].fields.assignee.name;
        ticket.assigneeAvatar = res.issues[i].fields.assignee.avatar;
      } else {
        ticket.assignee = "Unassigned";
      }

      ticket.firstTime = res.issues[i].fields.created;
      ticket.lastTime = res.issues[i].fields.updated;
      const currentDate = new Date();
      /* JIRA date's format use ISO 8601 Date format: YYYY-MM-DDTHH:MM:SS... */
      const firstDate = new Date(res.issues[i].fields.updated.substr(0, 19));
      const diffDays = TimeUtil.getDiffDays(firstDate, currentDate);
      const diffHours = TimeUtil.getDiffHours(firstDate, currentDate);
      if (diffDays === 0) {
        ticket.days = diffHours.toString() + " hour(s)";
      } else {
        ticket.days = diffDays.toString() + " day(s)";
      }
      ticket.status = res.issues[i].fields.status.name;
      if (res.issues[i].fields.resolution != null) {
        ticket.resolution = res.issues[i].fields.resolution.name;
      } else {
        ticket.resolution = "No Resolution";
      }
      ticket.projectName = res.issues[i].fields.project.name;
      tickets.push(ticket);
    }
    return tickets;
  }
}


