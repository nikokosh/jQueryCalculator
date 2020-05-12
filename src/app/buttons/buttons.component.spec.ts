import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChangeDetectionStrategy } from '@angular/core';

import { ButtonsComponent } from './buttons.component';
import { OPERATORS } from '../constants';

describe('ButtonsComponent', () => {
  let comp: ButtonsComponent;
  let fixture: ComponentFixture<ButtonsComponent>;
  const digits = [
    { str: 'zero', num: 0}, 
    { str: 'one', num: 1}, 
    { str: 'two', num: 2}, 
    { str: 'three', num: 3}, 
    { str: 'four', num: 4}, 
    { str: 'five', num: 5}, 
    { str: 'six', num: 6}, 
    { str: 'seven', num: 7}, 
    { str: 'eight', num: 8}, 
    { str: 'nine', num: 9}];

  const operators = Object.values(OPERATORS) 

  beforeEach(async(() => {
    TestBed.overrideComponent(ButtonsComponent, { add: {
      changeDetection: ChangeDetectionStrategy.Default
    }})
    TestBed.configureTestingModule({
      declarations: [ ButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonsComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should have digits', () => {
    digits.forEach(digit => {
      const digitBtn = fixture.nativeElement.querySelector(`#${digit.str}`); 
      expect(digitBtn).toBeTruthy();
      expect(digitBtn.textContent).toContain(digit.num);
    });
  });

  it('should have operators', () => {
    operators.forEach(operator => {
      const operatorBtn = fixture.nativeElement.querySelector(`#${operator.name}`);
      expect(operatorBtn).toBeTruthy();
      expect(operatorBtn.textContent).toContain(operator.value);
    });
  });

  it('should have other buttons', () => {
    const otherButtons = ['equals', 'decimal', 'clear'];
    otherButtons.forEach(btn => {
      expect(fixture.nativeElement.querySelector(`#${btn}`)).toBeTruthy();
    });
  });

  it('should raise an event when a digit button is pressed', () => {
    let result;
    comp.digitPressed.subscribe(res => result = res);

    digits.forEach(digit => {
      fixture.debugElement.query(By.css(`#${digit.str}`)).triggerEventHandler('click', null);
      expect(result).toBe(digit.num);
    });
  });
  
  it('should raise an event when an operator button is pressed', () => {
    let result;
    comp.operatorPressed.subscribe(res => result = res);
    
    operators.forEach(operator => {
      fixture.debugElement.query(By.css(`#${operator.name}`)).triggerEventHandler('click', null);
      expect(result).toBe(operator.value);
    })
  });
  
  it('should raise an event when clear button is pressed', () => {
    let pressed = false;
    comp.clearPressed.subscribe(() => pressed = true);

    fixture.debugElement.query(By.css(`#clear`)).triggerEventHandler('click', null);
    expect(pressed).toBeTrue();
  });

  it('should raise an event when clear button is pressed', () => {
    let pressed = false;
    comp.equalsPressed.subscribe(() => pressed = true);

    fixture.debugElement.query(By.css(`#equals`)).triggerEventHandler('click', null);
    expect(pressed).toBeTrue();
  });

  it('should raise an event when decimal button is pressed', () => {
    let pressed = false;
    comp.decimalPressed.subscribe(() => pressed = true);

    fixture.debugElement.query(By.css(`#decimal`)).triggerEventHandler('click', null);
    expect(pressed).toBeTrue();
  });
});
