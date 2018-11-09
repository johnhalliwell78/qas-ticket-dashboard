import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { TicketService, ErrorHandlingService } from "./services/index";
import { AppRoutingModule } from "./app-routing.module";
import { HttpClientModule } from "@angular/common/http";
import { AgGridModule } from "ag-grid-angular";
import { TicketGridComponent, SlideshowDashboardComponent, PieChartComponent } from "./components";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CarouselModule } from "ngx-bootstrap";
@NgModule({
  declarations: [
    AppComponent,
    TicketGridComponent,
    SlideshowDashboardComponent,
    PieChartComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    AgGridModule.withComponents([]),
    BrowserAnimationsModule,
    CarouselModule.forRoot()
  ],
  entryComponents: [
    TicketGridComponent,
    PieChartComponent
  ],
  providers: [
    TicketService,
    ErrorHandlingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
