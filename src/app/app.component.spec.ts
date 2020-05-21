import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MockComponent, MockService, MockHelper } from 'ng-mocks';
import { AppComponent } from './app.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { DisplayComponent } from './display/display.component';
import { DIGIT_LIMIT, OPERATORS, APP_REGEX } from './constants';
import { CalcService } from './calc.service';

let calcServiceStub: Partial<CalcService>;

describe('AppComponent', () => {
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  
  // stub UserService for test purposes
  calcServiceStub = {
    calc(expression: string): string {
      return '1'
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockComponent(ButtonsComponent),
        MockComponent(DisplayComponent)
      ],
      providers: [{ provide: CalcService, useValue: calcServiceStub }]
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

  it('should handle an expression with a current value of maximum length', () => {
    const createMaxLengthValue = (value: number) => {
      let res = '';
      for(let i = 0; i < DIGIT_LIMIT; i++) {
        res += value;
      }
      return res;
    }

    let currValue = createMaxLengthValue(1)
    comp.currentValue = currValue;
    comp.expression = currValue;
    comp.pressOperator(OPERATORS.multiply.value);
    comp.pressDigit(2);
    
    expect(comp.expression).toBe(`${currValue}*2`);
  });

  it('should reset currentValue when a digit follows an operator', () => {
    comp.currentValue ='12.3';
    comp.pressOperator(OPERATORS.add.value);
    comp.pressDigit(1);
    expect(comp.currentValue).toBe('1'); 
  });

  it('should reset expression and current value if a digit follows immediately =', () => {
    comp.expression = '2+2=4';
    comp.currentValue = '2';
    comp.pressDigit(6);
    expect(comp.currentValue).toBe('6');
    comp.pressOperator(OPERATORS.multiply.value);
    comp.pressDigit(3);
    expect(comp.expression).toBe('6*3');
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

  it('should not start an expression with a multiply or divide operator', () => {
    comp.pressOperator(OPERATORS.divide.value);
    comp.pressOperator(OPERATORS.multiply.value);
    expect(comp.expression).toBe('');
    comp.pressOperator(OPERATORS.add.value);
    comp.pressDigit(1);
    comp.pressEquals();
    expect(comp.currentValue).toBe('1');
    expect(comp.expression).toBe('+1=1');
  });

  it('should handle multiple operators serie: replace preceding operator (/*, +*, -*, ** ==> *)', () => {
    comp.pressDigit(2);
    comp.pressOperator(OPERATORS.add.value);
    comp.pressOperator(OPERATORS.multiply.value);
    comp.pressDigit(2);
    expect(comp.expression).toBe('2*2');
  });

  it('should handle multiple operators serie: let subtract operator follow another operator (*- ==> *-)', () => {
    comp.pressDigit(2);
    comp.pressOperator(OPERATORS.multiply.value);
    comp.pressOperator(OPERATORS.subtract.value);
    comp.pressOperator(OPERATORS.subtract.value);
    comp.pressDigit(2);
    expect(comp.expression).toBe('2*-2');
  });

  it('should handle multiple operators serie: replace triple operator by the last operator (/-+ ==> +)', () => {
    comp.pressDigit(2);
    comp.pressOperator(OPERATORS.multiply.value);
    comp.pressOperator(OPERATORS.divide.value);
    comp.pressOperator(OPERATORS.subtract.value);
    comp.pressOperator(OPERATORS.add.value);
    comp.pressDigit(2);
    expect(comp.expression).toBe('2+2');
  });

  it('should handle multiple operators serie: replace subtract operator followed by another subtract operator (-- ==> -) ', () => {
    comp.pressDigit(2);
    comp.pressOperator(OPERATORS.subtract.value);
    comp.pressOperator(OPERATORS.subtract.value);
    comp.pressDigit(2);
    expect(comp.expression).toBe('2-2');
  });
  
  it('should show answer when equals is pressed', () => {
    comp.expression = '4/-2+6*0.5';
    comp.pressEquals();
    expect(comp.expression).toBe('4/-2+6*0.5=1');
    expect(comp.currentValue).toBe('1');
  });

  it('should start a new calculation that operates on the result of the previous evaluation if an operator was pressed immediately after =', () => {
    comp.expression = '1+0';
    comp.currentValue = '1';
    comp.pressEquals();
    comp.pressOperator(OPERATORS.multiply.value);
    comp.pressDigit(1);
    expect(comp.expression).toBe('1*1');
    expect(comp.currentValue).toBe('1');

    comp.pressEquals();
    expect(comp.expression).toBe('1*1=1');
    expect(comp.currentValue).toBe('1');
  });

  it('should do nothing if calculation was already made but equals is pressed again', () => {
    comp.expression = '1+0';
    comp.currentValue = '0';
    comp.pressEquals();
    comp.pressEquals();
    expect(comp.expression).toBe('1+0=1');
    expect(comp.currentValue).toBe('1');
  });

  it('should restore default values when clear button is pressed', () => {
    comp.currentValue = '957';
    comp.expression = '3*957';

    comp.clear();
    
    expect(comp.currentValue).toBe('0');
    expect(comp.expression).toBe('');
  })
});
