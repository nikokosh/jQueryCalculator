import { TestBed } from '@angular/core/testing';
import { OPERATORS, APP_REGEX } from './constants';

import { CalcService } from './calc.service';


describe('CalcService', () => {
  let service: CalcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should do a current calculation', () => {
    let res = service.calc('4/-2+6*0.5');
    expect(res).toBe('1');
    
    res = service.calc('-10.4*-2+-70/-35-42*0.5*2*4');
    expect(res).toBe('-145.2');

    res = service.calc('10.4*-2+70/35-42*0.5*2*4');
    expect(res).toBe('-186.8');
  });

  it('should round up float numbers to 4 decimal places of precision', () => {
    let res = service.calc('2/7');
    expect(res).toBe('0.2857');
  });

  it('should round up float numbers to less than 4 decimal places of precision if needed', () => {
    let res = service.calc('21/4');
    expect(res).toBe('5.25');
  });
});
