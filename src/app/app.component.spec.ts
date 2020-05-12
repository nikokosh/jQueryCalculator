import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';
import { AppComponent } from './app.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { DisplayComponent } from './display/display.component';
import { DIGIT_LIMIT, OPERATORS } from './constants';


describe('AppComponent', () => {
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockComponent(ButtonsComponent),
        MockComponent(DisplayComponent)
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(comp).toBeTruthy();
  });

  it('should update currentDigit when a digit is pressed', () => {
    comp.pressDigit(5);
    expect(comp.currentValue).toBe('5');
    comp.pressDigit(7);
    expect(comp.currentValue).toBe('57');
  });

  it('should not have a leading zero in integer current value', () => {
    comp.pressDigit(0);
    expect(comp.currentValue).toBe('0');
    comp.pressDigit(5);
    expect(comp.currentValue).toBe('5');
  });
  
  it('should not have a zero after a leading zero', () => {
    comp.pressDigit(0);
    expect(comp.currentValue).toBe('0');
    comp.pressDigit(0);
    expect(comp.currentValue).toBe('0');
  });

  it('should accept float numbers as current value', () => {
    comp.pressDigit(0);
    comp.pressDigit(0);
    comp.pressDecimal();
    comp.pressDigit(1);
    comp.pressDecimal(); // should not take into account second decimal symbol
    comp.pressDigit(2);
    comp.pressDigit(3);
    expect(comp.currentValue).toBe('0.123');
  });

  it('should not have current value longer than DIGIT_LIMIT', () => {
    let currValue = '';
    for(let i = 0; i < DIGIT_LIMIT; i++) {
      currValue += 1;
    }
    comp.currentValue = currValue;

    comp.pressDigit(1);
    comp.pressDecimal();
    expect(comp.currentValue).toBe(currValue);
  });

  it('should reset currentValue when a digit follows an operator', () => {
    comp.currentValue ='12.3';
    comp.pressOperator(OPERATORS.add.value);
    comp.pressDigit(1);
    expect(comp.currentValue).toBe('1'); 
  });
  
  it('should compose expression string appropriately', () => {
    comp.pressDigit(0);
    comp.pressDigit(0);
    comp.pressDigit(2);
    comp.pressDecimal();
    comp.pressDigit(1);
    comp.pressDigit(5);
    expect(comp.expression).toBe('2.15');
  });

  it('should handle operators', () => {
    comp.pressDigit(2);
    comp.pressOperator(OPERATORS.add.value);
    comp.pressDigit(2);
    expect(comp.expression).toBe('2+2');
    comp.pressDecimal();
    comp.pressDigit(5);
    expect(comp.expression).toBe('2+2.5');
  });

  it('should replace an operator if another operator was chosen', () => {
    comp.pressDigit(2);
    comp.pressOperator(OPERATORS.add.value);
    comp.pressOperator(OPERATORS.multiply.value);
    comp.pressDigit(2);
    expect(comp.expression).toBe('2*2');
  });

  it('should add a subtract operator after another operator', () => {
    comp.pressDigit(2);
    comp.pressOperator(OPERATORS.multiply.value);
    comp.pressOperator(OPERATORS.subtract.value);
    comp.pressDigit(2);
    expect(comp.expression).toBe('2*-2');
  });
  
  it('should not have double subtract operator', () => {
    comp.pressDigit(2);
    comp.pressOperator(OPERATORS.subtract.value);
    comp.pressOperator(OPERATORS.subtract.value);
    comp.pressDigit(2);
    expect(comp.expression).toBe('2-2');
  });

  it('should restore default values when clear button is pressed', () => {
    comp.currentValue = '957';
    comp.expression = '3*957';

    comp.clear();
    
    expect(comp.currentValue).toBe('0');
    expect(comp.expression).toBe('');
  })
});
