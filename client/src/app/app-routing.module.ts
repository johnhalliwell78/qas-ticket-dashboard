import { Routes, RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";

const appRoutes: Routes = [
    // { path: "login", component: LoginComponent },
    // { path: "richgrid", component: RichGridComponent },
    // { path: "dashboard", component: DashboardComponent, canActivate: [AuthGuard] },
    // otherwise redirect to home
    { path: "**", redirectTo: "" }

];


@NgModule({
    imports: [ RouterModule.forRoot(appRoutes) ],
    exports: [ RouterModule ]
  })

export class AppRoutingModule { }
