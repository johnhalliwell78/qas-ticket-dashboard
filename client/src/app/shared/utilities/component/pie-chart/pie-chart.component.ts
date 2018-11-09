import {Component, OnInit, NgModule, ViewChild, ElementRef, AfterViewInit} from "@angular/core";
import {Project} from "../../../../models";
import * as CHART_TYPE from "../../../../models/chart-type.const";

@Component({
  selector: "app-pie-chart",
  templateUrl: "./pie-chart.component.html",
  styleUrls: ["./pie-chart.component.less"]
})
export class PieChartComponent implements OnInit, AfterViewInit {
  public data: any[];
  public project: Project;
  public chartType: string;
  public label: string;
  public total: number;
  colorScheme = {
    domain: ["#5AA454", "#C7B42C", "#A10A28", "#AAAAAA"]
  };

  resultData: any[];

  @ViewChild("pieChart") sketchElement: ElementRef;
  @ViewChild("legend") legendElement: ElementRef;


  ngAfterViewInit(): void {
    /* Defined in general-title of slideshow component */
    const titleHeight = window.screen.height * 0.1;
    const boxWidth = window.screen.width;
    const boxHeight = window.screen.height * 0.9;
    const chartWidth = (this.project)
      ? (boxWidth / 4)
      : boxWidth / 3;
    const chartHeight = (this.project)
      ? (boxHeight + titleHeight) * 0.5 * 0.45 // boxHeight + titleHeight === SCREEN_HEIGHT
      : boxHeight * 0.6;
    this.sketchElement.nativeElement.width = chartWidth;
    this.sketchElement.nativeElement.height = chartHeight;
    this.drawChart(this.sketchElement.nativeElement, this.legendElement.nativeElement);
  }


  constructor(private el: ElementRef) {
    this.total = 0;
  }

  ngOnInit() {
    if (this.chartType === CHART_TYPE.STATUS) {
      this.label = "Total ticket status";
    } else if (this.chartType === CHART_TYPE.AGE) {
      this.label = "Total ticket age";
    } else if (this.chartType === CHART_TYPE.PROJECTS) {
      this.label = "Total ticket projects";
    }
    if (this.project) {
      this.filterDataByProject();
    }
    this.createDataForChart();
    for (let i = 0; i < this.resultData.length; i++) {
      this.total += this.resultData[i].value;
    }
  }

  private filterDataByProject() {
    const filteredData = [];
    const dataLen = this.data.length;
    for (let i = 0; i < dataLen; i++) {
      let projectCode = this.data[i].JIRA_KEY;
      projectCode = projectCode.substr(0, projectCode.indexOf("-"));
      if (projectCode === this.project.code) {
        filteredData.push(this.data[i]);
      }
    }
    this.data.splice(0, dataLen);
    this.data = filteredData;
  }

  private createDataForChart() {
    if (this.chartType === CHART_TYPE.STATUS) {
      this.resultData = this.createDataByStatus();
    } else if (this.chartType === CHART_TYPE.AGE) {
      this.resultData = this.createDataByAge();
    } else if (this.chartType === CHART_TYPE.PROJECTS) {
      this.resultData = this.createDataByProjects();
    }

  }

  private createDataByStatus() {
    const resultData = [];
    const dataLen = this.data.length;
    let todo = 0;
    let waiting = 0;
    let inprogress = 0;
    let others = 0;
    for (let i = 0; i < dataLen; i++) {
      switch (this.data[i].JIRA_STATUS) {
        case "To Do": {
          todo += 1;
          break;
        }
        case "Waiting For Customer": {
          waiting += 1;
          break;
        }
        // case "Testing": {
        //   break;
        // }
        case "In Progress": {
          inprogress += 1;
          break;
        }
        // case "Need To Review": {
        //   break;
        // }
        // case "Feature Request": {
        //   break;
        // }
        default: {
          others += 1;
          break;
        }
      }
    }
    const todoElement = {
      "name": "To Do",
      "value": todo
    };
    const waitingElement = {
      "name": "Waiting",
      "value": waiting
    };
    const inprogressElement = {
      "name": "In Progress",
      "value": inprogress
    };
    const othersElement = {
      "name": "Others",
      "value": others
    };
    resultData.push(waitingElement);
    resultData.push(todoElement);
    resultData.push(inprogressElement);
    resultData.push(othersElement);
    return resultData;
  }

  private createDataByAge() {
    const resultData = [];
    const dataLen = this.data.length;
    let today = 0;
    let yesterday = 0;
    let morethan2days = 0;
    for (let i = 0; i < dataLen; i++) {
      if (this.data[i].JIRA_DAYS.indexOf(" hour(s)") > -1) {
        today += 1;
      } else {
        if (this.data[i].JIRA_DAYS.substring(0, this.data[i].JIRA_DAYS.length - 7) === "1") {
          yesterday += 1;
        } else {
          morethan2days += 1;
        }
      }
    }
    const todayElement = {
      "name": "Today",
      "value": today
    };
    const yesterdayElement = {
      "name": "Yesterday",
      "value": yesterday
    };
    const morethan2daysElement = {
      "name": "Others",
      "value": morethan2days
    };
    resultData.push(todayElement);
    resultData.push(yesterdayElement);
    resultData.push(morethan2daysElement);
    return resultData;
  }

  private createDataByProjects() {
    const resultData = [];
    const dataLen = this.data.length;
    const projects: Project[] = [];
    const projectTickets = [];
    let iProject = 0;
    /* Count number of ticket for each project */
    for (let i = 0; i < dataLen; i++) {
      iProject = this.appendProject(projects, this.data[i].JIRA_KEY);
      if (projectTickets.length === iProject) {
        projectTickets.push(1);
      } else {
        projectTickets[iProject]++;
      }
    }
    /* Create input data for chart */
    for (let j = 0; j < projects.length; j++) {
      const projectElement = {
        "name": projects[j].code,
        "value": projectTickets[j]
      };
      resultData.push(projectElement);
    }
    return resultData;
  }

  private appendProject(projects: Project[], projectCode: string): number {
    let isExists = false;
    projectCode = projectCode.substr(0, projectCode.indexOf("-"));
    for (let i = 0; i < projects.length; i++) {
      if (projects[i].code === projectCode) {
        isExists = true;
        return i;
      }
    }
    if (!isExists) {
      const project = new Project();
      project.code = projectCode;
      projects.push(project);
    }
    return projects.length - 1;
  }
  private drawPieSlice(chartContext, centerX, centerY, radius, startAngle, endAngle, color) {
    chartContext.fillStyle = color;
    chartContext.beginPath();
    chartContext.moveTo(centerX, centerY);
    chartContext.arc(centerX, centerY, radius, startAngle, endAngle);
    chartContext.closePath();
    chartContext.fill();
  }

  private drawChart(canvasElement: HTMLCanvasElement, legendElement: HTMLElement) {
    const chartContext = canvasElement.getContext("2d");
    let colorIndex = 0;
    let startAngle = 0;
    for (let i = 0; i < this.resultData.length; i++) {
      const sliceAngle = 2 * Math.PI * this.resultData[i].value / this.total;
      this.drawPieSlice(
        chartContext,
        canvasElement.width / 2,
        canvasElement.height / 2,
        Math.min(canvasElement.width / 2, canvasElement.height / 2),
        startAngle,
        startAngle + sliceAngle,
        this.colorScheme.domain[colorIndex % this.colorScheme.domain.length]);
      startAngle += sliceAngle;
      colorIndex++;
    }
    legendElement.innerHTML = this.drawLegend();

  }

  private drawLegend(): string {
    let columnWidth;
    let emptyColumnWidth; // For chart legend in general slide
    if (!this.project) {
      // if (this.resultData.length === 3) { // Only 3 items in legend of general slide chart
      //   emptyColumnWidth = 2;
      //   columnWidth = Math.floor((12 - emptyColumnWidth) / this.resultData.length);
      // } else if (this.resultData.length >= 4) {
      //   emptyColumnWidth = 0;
      //   columnWidth = 6;
      // } else if (this.resultData.length === 2) { // Only 2 items in legend of general slide chart
      //   emptyColumnWidth = 3;
      //   columnWidth = Math.floor((12 - emptyColumnWidth) / this.resultData.length);
      // }
      emptyColumnWidth = 2;
      columnWidth = 5;
    } else {
      /* If the width of the legend area < 500 and legend items > 3 */
      columnWidth = (this.legendElement.nativeElement.clientWidth < 500 && this.resultData.length > 3)
        ? 6
        : (12 / this.resultData.length);
    }
    /* If the slide is focused on specific project font-size: 150%. For general slide: 200% */
    const fontSize = (this.project) ? "150%" : "200%";
    const labelHeight = (this.project) ? "60px" : "90px";
    let color_index = 0;
    let legendHTML = "<div class='row' style='height:100%;'>";
    legendHTML += "<div class='col-" + 12 + "' style='height: 0px; width: 0px;'>" + "</div>";
    for (let i = 0; i < this.resultData.length; i++) {
      const itemName = "<li>" + this.resultData[i].name + "</li>";
      const itemQuantity = "<li>" + this.resultData[i].value + "</li>";
      const itemPercent = "<li style='font-size:115%; opacity:0.85;'>"
        + Math.round(100 * (this.resultData[i].value / this.total))
        + "%" + "</li>";
      if (i % 2 === 0) {
        if (emptyColumnWidth > 0) {
          legendHTML += "<div class='col-" + emptyColumnWidth + "' style='height: 0px;'>" + "</div>";
        }
      }
      legendHTML += "<div class='col-" + columnWidth + "'>"
        + "<div style='float:left; display:block; width:10px; height: " + labelHeight + "; background-color:"
        + this.colorScheme.domain[color_index++]
        + ";'></div> "
        + "<ul style='list-style-type:none; font-size:" + fontSize + "; margin-left:20px; padding:0 0;'>"
        + itemName
        + itemQuantity
        + itemPercent
        + "</ul>"
        + "</div>";
    }
    legendHTML += "</div>";
    return legendHTML;
  }
}
