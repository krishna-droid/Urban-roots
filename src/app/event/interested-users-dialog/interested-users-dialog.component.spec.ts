import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestedUsersDialogComponent } from './interested-users-dialog.component';

describe('InterestedUsersDialogComponent', () => {
  let component: InterestedUsersDialogComponent;
  let fixture: ComponentFixture<InterestedUsersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestedUsersDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterestedUsersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
