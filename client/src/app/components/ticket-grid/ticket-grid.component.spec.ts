import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TicketGridComponent } from "./ticket-grid.component";

describe("TicketGridComponent", () => {
  let component: TicketGridComponent;
  let fixture: ComponentFixture<TicketGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
