import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectionStrategy } from '@angular/core';

import { DisplayComponent } from './display.component';

describe('DisplayComponent', () => {
  let comp: DisplayComponent;
  let fixture: ComponentFixture<DisplayComponent>;

  beforeEach(async(() => {
    TestBed.overrideComponent(DisplayComponent, { add: {
      changeDetection: ChangeDetectionStrategy.Default
    }});
    TestBed.configureTestingModule({
      declarations: [ DisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should have a display element', () => {
    expect(fixture.nativeElement.querySelector('#display')).toBeTruthy();
  });
  
  it('should update display value', () => {
    expect(fixture.nativeElement.querySelector('#display').textContent).toBe('0');
    
    comp.value = '5';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#display').textContent).toBe('5');
  });
  
  it('should update expression value', () => {
    expect(fixture.nativeElement.querySelector('#expression').textContent).toBe('');
    
    comp.expression = '2+2';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#expression').textContent).toBe('2+2');
  });
});
