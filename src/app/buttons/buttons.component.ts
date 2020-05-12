import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OPERATORS } from '../constants';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html',
  styleUrls: ['./buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonsComponent {

  @Output() digitPressed = new EventEmitter<number>()
  @Output() operatorPressed = new EventEmitter<string>()
  @Output() clearPressed = new EventEmitter<void>()
  @Output() equalsPressed = new EventEmitter<void>()
  @Output() decimalPressed = new EventEmitter<void>()
  readonly operators = OPERATORS

  pressDigit(digit: number) {
    this.digitPressed.emit(digit)
  }

  pressOperator(operator: string) {
    this.operatorPressed.emit(operator)
  }

  pressClear() {
    this.clearPressed.emit()
  }

  pressEquals() {
    this.equalsPressed.emit()
  }

  pressDecimal() {
    this.decimalPressed.emit()
  }
}
