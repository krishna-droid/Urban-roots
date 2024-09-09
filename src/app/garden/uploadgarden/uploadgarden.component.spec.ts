import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadgardenComponent } from './uploadgarden.component';

describe('UploadgardenComponent', () => {
  let component: UploadgardenComponent;
  let fixture: ComponentFixture<UploadgardenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadgardenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadgardenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
