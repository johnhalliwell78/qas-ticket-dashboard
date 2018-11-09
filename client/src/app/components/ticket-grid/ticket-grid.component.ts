import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { GridOptions } from "ag-grid";
import { TicketService } from "../../services/ticket.service";
import { Ticket, Project } from "../../models";
import { error } from "util";
import { TimeUtil } from "../../shared/utilities";
@Component({
  selector: "app-ticket-grid",
  templateUrl: "./ticket-grid.component.html",
  styleUrls: ["./ticket-grid.component.less"]

})


export class TicketGridComponent implements OnInit, AfterViewInit {
  private gridApi;
  private gridColumnApi;
  public gridOptions: GridOptions;
  public data: any[];
  public project: Project;
  @ViewChild("ageFilter") ageFilter: ElementRef;
  private ageFilterStatus: string;
  style = {
    width: "100%",
    height: "97%"
  };
  constructor() {
    this.gridOptions = <GridOptions>{};
    this.gridOptions.columnDefs = this.createColumnDefs();
    this.gridOptions.getRowStyle = function (params) {
      if (params.node.rowIndex % 2 === 0) {
        return { background: "#F2F2F2" };
      }
    };
    this.gridOptions.getRowHeight = function (params) {
      return groupHeight;
    };
    this.gridOptions.toolPanelSuppressSideButtons = true;
    this.gridOptions.animateRows = true;
    this.ageFilterStatus = "today";
  }

  ngOnInit(): void {
    this.filterByProject();
  }

  ngAfterViewInit(): void {
    // this.runAgeFilterAfterSomeMs(5000);
  }

  runAgeFilterAfterSomeMs(ms: Number) {
    TimeUtil.sleep(ms).then(() => {
      this.ageFilter.nativeElement.click();
      if (this.ageFilterStatus === "all") {
        return;
      }
      this.runAgeFilterAfterSomeMs(ms);
    });
  }

  private createColumnDefs() {
    const columnDefs = [
      {
        headerName: "Id",
        field: "JIRA_KEY",
        width: 110,
        pinned: true,
        editable: false,
        // cellStyle: {"text-align": "center"},
        cellRenderer: function (params) {
          return embedCellStyleToValue("<a href=\"https://agile.qasymphony.com/browse/"
            + params.value + "\" target=\"_blank\" >"
            + params.value
            + "</a>");
        }
      },
      {
        headerName: "First Touch",
        field: "JIRA_FIRSTTIME",
        width: 125,
        pinned: true,
        cellRenderer: function (params) {
          // return pad(params.value.getDate(), 2) + '/' + params.value.getMonth() + '/' + params.value.getFullYear();
          return embedCellStyleToValue(params.value.toString().substring(0, 10));
        },
        filter: "date",
        columnGroupShow: "open"
      },
      {
        headerName: "Assignee", field: "JIRA_ASSIGNEE", width: 155, filter: "agTextColumnFilter",
        cellRenderer: function (params) {
          if (params.value.avatar) {
            return `<img src="${params.value.avatar}" style="width: 40px; height: 40px; border-radius: 50%" /> ${params.value.name}`;
          } else {
            return `${params.value.name}`;
          }
        }
      },
      {
        headerName: "Status",
        field: "JIRA_STATUS",
        width: 125,
        cellRenderer: function (params) {
          // const value = (params.value.length > 15) ? params.value.substr(0, 14) + "..." : params.value;
          return embedCellStyleToValue(params.value);
        },
        cellStyle: function (params) {
          switch (params.value) {
            case "To Do": {
              return { backgroundColor: "#ED5565" };

            }
            case "Waiting For Customer": {
              // statements;
              return { backgroundColor: "#FFCE54" };

            }
            case "Testing": {
              // statements;
              return { backgroundColor: "#AC92EC" };

            }
            case "Done": {
              // statements;
              return { backgroundColor: "#4FC1E9" };

            }
            case "In Progress": {
              // statements;
              return { backgroundColor: "#48CFAD" };

            }
            case "Need To Review": {
              // statements;
              return { backgroundColor: "#A0D468" };
            }
            case "Feature Request": {
              // statements;
              return { backgroundColor: "#DF88FF" };
            }
            default: {
              // statements;
              return {};
            }
          }
          // supply an angular component
          // cellRendererFramework: ProficiencyRenderComponent
        }
      },
      {
        headerName: "Last Updated",
        field: "JIRA_LASTTIME",
        width: 140,
        pinned: true,
        cellRenderer: function (params) {
          return embedCellStyleToValue(params.value.toString().substring(0, 10));
        },
        filter: "date",
        columnGroupShow: "open"
      },
      {
        headerName: "Age", field: "JIRA_DAYS", width: 90,
        cellRenderer: function (params) {
          return embedCellStyleToValue(params.value);
        }
      }
      // {
      //   headerName: "Resolution", field: "JIRA_RESOLUTION", width: 215, filter: "agTextColumnFilter",
      //   cellRenderer: function (params) {
      //     return embedCellStyleToValue(params.value);
      //   }
      // }
    ];
    return columnDefs;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    groupHeight = 46;
    this.gridApi.resetRowHeights();
    params.api.sizeColumnsToFit();

  }

  onGridSizeChanged(params) {
    const gridWidth = document.getElementById("grid-wrapper").offsetWidth;
    const columnsToShow = [];
    const columnsToHide = [];
    let totalColsWidth = 0;
    const allColumns = params.columnApi.getAllColumns();
    for (let i = 0; i < allColumns.length; i++) {
      const column = allColumns[i];
      totalColsWidth += column.getMinWidth();
      if (totalColsWidth > gridWidth) {
        columnsToHide.push(column.colId);
      } else {
        columnsToShow.push(column.colId);
      }
    }
    params.columnApi.setColumnsVisible(columnsToShow, true);
    params.columnApi.setColumnsVisible(columnsToHide, false);
    params.api.sizeColumnsToFit();
  }

  private filterByProject(): void {
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
  public filterByAge(): void {
    const ageFilterComponent = this.gridApi.getFilterInstance("JIRA_DAYS");
    ageFilterComponent.selectNothing();
    for (let i = 0; i < ageFilterComponent.getUniqueValueCount(); i++) {
      const value = ageFilterComponent.getUniqueValue(i);
      let isChosen = false;
      if (this.ageFilterStatus === "today") {
        isChosen = (value.indexOf(" hour(s) ago") > -1);
      } else if (this.ageFilterStatus === "yesterday") {
        isChosen = ((value.indexOf(" hour(s) ago") === -1) && Number(value) === 1);
      } else if (this.ageFilterStatus === "morethan2days") {
        isChosen = ((value.indexOf(" hour(s) ago") === -1) && Number(value) > 1);
      } else { isChosen = true; }
      if (isChosen) {
        ageFilterComponent.selectValue(value);
      }
    }
    this.gridApi.onFilterChanged();
    if (this.ageFilterStatus === "today") {
      this.ageFilterStatus = "yesterday";
    } else if (this.ageFilterStatus === "yesterday") {
      this.ageFilterStatus = "morethan2days";
    } else if (this.ageFilterStatus === "morethan2days") {
      this.ageFilterStatus = "all";
    } else {
      this.ageFilterStatus = "today";
    }
  }

}
function embedCellStyleToValue(value): string {
  const cellStyle = `<div style="width: 100%;`
    + `height: 100%;`
    + `line-height: 15px;`
    + `padding-top: 15px;`
    + `text-overflow: ellipsis;`
    + `overflow: hidden;">`;
  return cellStyle + value + `</div>`;
}
let groupHeight = 30;
