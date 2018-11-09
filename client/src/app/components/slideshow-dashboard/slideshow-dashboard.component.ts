import {
  Component,
  OnInit,
  ViewContainerRef,
  ComponentFactoryResolver,
  QueryList,
  ViewChildren,
  DoCheck,
  ViewChild
} from "@angular/core";
import { TicketService } from "../../services/ticket.service";
import { Observable } from "rxjs/Observable";
import { Ticket, Project } from "../../models";
import { ArrayUtil } from "../../shared/utilities";
import { PieChartComponent } from "../../shared/utilities/component/pie-chart/pie-chart.component";
import { TicketGridComponent } from "../ticket-grid/ticket-grid.component";
import * as CHART_TYPE from "../../models/chart-type.const";
import { TimeUtil } from "../../shared/utilities";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-slideshow-dashboard",
  templateUrl: "./slideshow-dashboard.component.html",
  styleUrls: ["./slideshow-dashboard.component.less"]
})
export class SlideshowDashboardComponent implements OnInit, DoCheck {
  @ViewChildren("grid", { read: ViewContainerRef }) gridContainer: QueryList<ViewContainerRef>;
  @ViewChildren("statuschart", { read: ViewContainerRef }) statusChartContainer: QueryList<ViewContainerRef>;
  @ViewChildren("agechart", { read: ViewContainerRef }) ageChartContainer: QueryList<ViewContainerRef>;
  @ViewChild("projectschart", { read: ViewContainerRef }) projectsChartContainer: ViewContainerRef;
  rowData: any[];
  projects: Project[];
  gridComponentRef: any;
  chartStatusComponentRef: any;
  chartAgeComponentRef: any;
  chartProjectsComponentRef: any;
  slideIndex: Number;
  isInit: boolean;
  currentProjectName;
  slideShowInterval = 30000;
  constructor(
    private ticketService: TicketService,
    private _cfr: ComponentFactoryResolver
  ) {
    this.rowData = [];
    this.slideIndex = 0;
    this.isInit = false;
  }

  ngOnInit() {
    this.ticketService.getKeys()
      .subscribe(tickets => {
        this.projects = [];
        this.currentProjectName = tickets[0].projectName;
        this.createRowData(tickets);
      });
    this.reloadDataAfterSomeMs();
  }

  reloadDataAfterSomeMs() {
    TimeUtil.sleep(environment.RELOAD_INTERVAL).then(() => {
      this.ticketService.getKeys()
      .subscribe(tickets => {
        this.createRowData(tickets);
        this.reloadDataAfterSomeMs();
      });
    });
  }

  ngDoCheck() {
    /* Initialize first grid & chart component once only after receiving data from ticket service*/
    if (!this.isInit && this.gridContainer && this.gridContainer.toArray().length > 0) {
      const gridComponentRef = this.createGridComponent(0);
      const chartStatusComponentRef = this.createChartComponent(CHART_TYPE.STATUS, 0);
      const chartAgeComponentRef = this.createChartComponent(CHART_TYPE.AGE, 0);
      this.gridComponentRef = gridComponentRef;
      this.chartStatusComponentRef = chartStatusComponentRef;
      this.chartAgeComponentRef = chartAgeComponentRef;
      this.isInit = true;
    }
  }

  public createRowData(tickets: Ticket[]) {
    /* Do nothing in case http request failed */
    if (typeof tickets === "undefined" || tickets.length === 0) {
      return;
    }
    /* Remove all data in rowData before using it */
    while (this.rowData.length > 0) {
      this.rowData.pop();
    }
    /* Push new data into rowData */
    for (let i = 0; i < tickets.length; i++) {
      // if (tickets[i].status !== "Done") {
        this.appendProject(tickets[i].projectName, tickets[i].key);
        this.rowData.push({
          JIRA_KEY: tickets[i].key,
          JIRA_FIRSTTIME: tickets[i].firstTime,
          JIRA_ASSIGNEE: { name: tickets[i].assignee, avatar: tickets[i].assigneeAvatar },
          JIRA_STATUS: tickets[i].status,
          JIRA_LASTTIME: tickets[i].lastTime,
          JIRA_DAYS: tickets[i].days,
          JIRA_RESOLUTION: tickets[i].resolution,
        });
      // }
    }
  }

  private appendProject(projectName: string, projectCode: string) {
    let isExists = false;
    projectCode = projectCode.substr(0, projectCode.indexOf("-"));
    for (let i = 0; i < this.projects.length; i++) {
      if (this.projects[i].code === projectCode) {
        isExists = true;
        break;
      }
    }
    if (!isExists) {
      const project = new Project();
      project.code = projectCode;
      project.name = projectName;
      this.projects.push(project);
    }
  }
  onSelect(event) {
    if (this.slideIndex === event) { return; } else { this.slideIndex = event; }
    this.currentProjectName = (event < this.projects.length) ? this.projects[event].name : "QAS";
    if (this.gridComponentRef) {
      this.gridComponentRef.destroy();
    }
    if (this.chartProjectsComponentRef) {
      this.chartProjectsComponentRef.destroy();
    }
    this.chartStatusComponentRef.destroy();
    this.chartAgeComponentRef.destroy();
    const gridComponentRef = (event < this.projects.length)
      ? this.createGridComponent(event)
      : undefined;
    const chartStatusComponentRef = (event < this.projects.length)
      ? this.createChartComponent(CHART_TYPE.STATUS, event)
      : this.createChartComponent(CHART_TYPE.STATUS);
    const chartAgeComponentRef = (event < this.projects.length)
      ? this.createChartComponent(CHART_TYPE.AGE, event)
      : this.createChartComponent(CHART_TYPE.AGE);
    const chartProjectsComponentRef = (event < this.projects.length)
      ? undefined
      : this.createChartComponent(CHART_TYPE.PROJECTS);
    this.gridComponentRef = gridComponentRef;
    this.chartStatusComponentRef = chartStatusComponentRef;
    this.chartAgeComponentRef = chartAgeComponentRef;
    this.chartProjectsComponentRef = chartProjectsComponentRef;

  }

  createGridComponent(index) {
    const comp = this._cfr.resolveComponentFactory(TicketGridComponent);
    const gridComponent = this.gridContainer.toArray()[index].createComponent(comp);
    gridComponent.instance.data = ArrayUtil.duplicateArray(this.rowData);
    gridComponent.instance.project = this.projects[index];
    return gridComponent;
  }
  createChartComponent(chartType: string, index?: number) {
    const comp = this._cfr.resolveComponentFactory(PieChartComponent);
    let chartComponent;
    if (index !== undefined) {
      if (chartType === CHART_TYPE.STATUS) {
        chartComponent = this.statusChartContainer.toArray()[index].createComponent(comp);
      } else if (chartType === CHART_TYPE.AGE) {
        chartComponent = this.ageChartContainer.toArray()[index].createComponent(comp);
      }
    } else {  // If no index, this must be the component for the general slide
      if (chartType === CHART_TYPE.STATUS) {
        chartComponent = this.statusChartContainer.toArray()[this.projects.length].createComponent(comp);
      } else if (chartType === CHART_TYPE.AGE) {
        chartComponent = this.ageChartContainer.toArray()[this.projects.length].createComponent(comp);
      } else if (chartType === CHART_TYPE.PROJECTS) {
        chartComponent = this.projectsChartContainer.createComponent(comp);
      }
    }
    chartComponent.instance.data = ArrayUtil.duplicateArray(this.rowData);
    if (index !== undefined) {
      chartComponent.instance.project = this.projects[index];
    }
    chartComponent.instance.chartType = chartType;
    return chartComponent;
  }
}

