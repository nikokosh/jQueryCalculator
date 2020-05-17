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
    comp.pressEquals();

    let expectedResult = createMaxLengthValue(2);
    expect(comp.currentValue).toBe(expectedResult);
    expect(comp.expression).toBe(`${currValue}*2=${expectedResult}`);
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
    comp.pressDigit(4);
    comp.pressOperator(OPERATORS.divide.value);
    comp.pressOperator(OPERATORS.subtract.value);
    comp.pressDigit(2); // -2
    comp.pressOperator(OPERATORS.add.value);
    comp.pressDigit(6); 
    comp.pressOperator(OPERATORS.multiply.value);
    comp.pressDigit(0);
    comp.pressDecimal();
    comp.pressDigit(5);
    
    comp.pressEquals();
    expect(comp.expression).toBe('4/-2+6*0.5=1');
    expect(comp.currentValue).toBe('1');

    comp.expression = '-10.4*-2+-70/-35-42*0.5*2*4';
    comp.currentValue = '4';
    comp.pressEquals();
    expect(comp.expression).toBe('-10.4*-2+-70/-35-42*0.5*2*4=-145.2');
    expect(comp.currentValue).toBe('-145.2');

    comp.expression = '10.4*-2+70/35-42*0.5*2*4';
    comp.currentValue = '4';
    comp.pressEquals();
    expect(comp.expression).toBe('10.4*-2+70/35-42*0.5*2*4=-186.8');
    expect(comp.currentValue).toBe('-186.8');
  });

  it('should start a new calculation that operates on the result of the previous evaluation if an operator was pressed immediately after =', () => {
    comp.expression = '2+2';
    comp.currentValue = '2';
    comp.pressEquals();
    comp.pressOperator(OPERATORS.multiply.value);
    comp.pressDigit(3);
    expect(comp.expression).toBe('4*3');
    expect(comp.currentValue).toBe('3');

    comp.pressEquals();
    expect(comp.expression).toBe('4*3=12');
    expect(comp.currentValue).toBe('12');
  });

  it('should round up float numbers to 4 decimal places of precision', () => {
    comp.pressDigit(2);
    comp.pressOperator(OPERATORS.divide.value);
    comp.pressDigit(7);
    
    comp.pressEquals();
    expect(comp.expression).toBe('2/7=0.2857');
    expect(comp.currentValue).toBe('0.2857');
  });
  
  it('should do nothing if calculation was already made but equals is pressed again', () => {
    comp.expression = '2+2';
    comp.currentValue = '2';
    comp.pressEquals();
    comp.pressEquals();
    expect(comp.expression).toBe('2+2=4');
    expect(comp.currentValue).toBe('4');
  });

  it('should restore default values when clear button is pressed', () => {
    comp.currentValue = '957';
    comp.expression = '3*957';

    comp.clear();
    
    expect(comp.currentValue).toBe('0');
    expect(comp.expression).toBe('');
  })
});
