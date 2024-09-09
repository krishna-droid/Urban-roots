import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareMyGardenComponent } from './share-my-garden.component';

describe('ShareMyGardenComponent', () => {
  let component: ShareMyGardenComponent;
  let fixture: ComponentFixture<ShareMyGardenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareMyGardenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareMyGardenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
