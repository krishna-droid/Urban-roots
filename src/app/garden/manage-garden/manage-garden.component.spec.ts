import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGardenComponent } from './manage-garden.component';

describe('ManageGardenComponent', () => {
  let component: ManageGardenComponent;
  let fixture: ComponentFixture<ManageGardenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageGardenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageGardenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
