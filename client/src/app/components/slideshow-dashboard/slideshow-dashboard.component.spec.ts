import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { SlideshowDashboardComponent } from "./slideshow-dashboard.component";

describe("SlideshowDashboardComponent", () => {
  let component: SlideshowDashboardComponent;
  let fixture: ComponentFixture<SlideshowDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SlideshowDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SlideshowDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
