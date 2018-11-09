import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import {LicenseManager} from "ag-grid-enterprise/main";

LicenseManager.setLicenseKey
("Evaluation_License_Valid_Until_16_May_2018__MTUyNjQyNTIwMDAwMA==816316e8c90ed402ff28dcf64cfe4646");
if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
// Dsadsad
