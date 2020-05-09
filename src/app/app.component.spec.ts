import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';
import { AppComponent } from './app.component';
import { ButtonsComponent } from './buttons/buttons.component';
import { DisplayComponent } from './display/display.component';


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
    expect(comp.currentDigit).toBe('5');
    comp.pressDigit(7);
    expect(comp.currentDigit).toBe('57');
  });

  it('should restore default values when clear button is pressed', () => {
    comp.currentDigit = '957';
    comp.expression = '3*957';

    comp.clear();
    
    expect(comp.currentDigit).toBe('0');
    expect(comp.expression).toBe('');
  })
});
