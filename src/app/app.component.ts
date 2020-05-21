import { Component } from '@angular/core';
import { DIGIT_LIMIT, OPERATORS, APP_REGEX } from './constants';
import { CalcService } from './calc.service';

interface AppState {
  currentValue: string
  expression: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  currentValue: string = '0'
  expression: string = ''

  constructor(private calcService: CalcService) {}

  pressDigit(digit: number) {
    if (this.isPreviousSymbolAnOperator() || this.isLessThanLimit()) {

      if (this.isPreviousSymbolAnOperator()) this.currentValue = ''

      const updateState = (currentValue: string, expression: string): AppState => ({ currentValue, expression })

      const handleInteger = (num: string, expr: string): AppState => ({
        currentValue: `${parseInt(num)}`, // remove excess zeros at the beginning of the string with parseInt
        expression: this.isPreviousSymbolAnOperator() ?
          expr + parseInt(num) :
          expr.replace(APP_REGEX.lastNumInExpression, `${parseInt(num)}`) 
      })

      const updatedValues: AppState = this.isEqualsPressed() ?
        updateState(`${digit}`, `${digit}`) : // start new calculation
        this.isFloat(this.currentValue + digit) ?
          updateState(this.currentValue + digit, this.expression + digit) :
          handleInteger(this.currentValue + digit, this.expression)

      this.currentValue = updatedValues.currentValue
      this.expression = updatedValues.expression
    }
  }

  pressDecimal() {
    if (this.isLessThanLimit()) {
      const decimal = !this.isFloat(this.currentValue) ? '.' : ''
      this.currentValue += decimal
      this.expression += decimal
    }
  }

  pressOperator(o: string) {
    const handleOperatorsSerie = (expression: string, operator: string): string => {
      if (operator === OPERATORS.subtract.value) {
        return (expression[expression.length-1] === OPERATORS.subtract.value) ?
          expression : // 1. replace subtract operator followed by another subtract operator (-- ==> -) 
          expression += operator // 2. let subtract operator follow another operator (*- ==> *-)
      } else if (APP_REGEX.operatorsSerie.test(expression)) {
        return expression.replace(APP_REGEX.operatorsSerie, operator) // 3. replace triple operator by the last operator (/-+ ==> +)
      } else if (operator !== OPERATORS.subtract.value) {
        return expression.substring(0, expression.length-1) + operator // 4. replace preceding operator (/*, +*, -*, ** ==> *)
      }
    }

    this.expression = this.isEqualsPressed() ?
      this.currentValue + o : // Pressing an operator immediately following = should start a new calculation that operates on the result of the previous evaluation.
      this.expression.length === 0 ?
        (o === OPERATORS.add.value || o === OPERATORS.subtract.value) ?
          this.expression + o :
          this.expression : // can't use * or / to start an operation
        this.isPreviousSymbolAnOperator() ?
          handleOperatorsSerie(this.expression, o) :
          this.expression + o
  }

  pressEquals() {
    if (!this.isEqualsPressed()) {
      const result = this.calcService.calc(this.expression)
      this.currentValue = result
      this.expression = this.expression + '=' + result
    }
  }
  
  clear() {
    this.currentValue = '0'
    this.expression = ''
  }

  private isEqualsPressed(expression: string = this.expression): boolean {
    return /=/.test(expression)
  }

  private isPreviousSymbolAnOperator(expr: string = this.expression): boolean {
    return Object.values(OPERATORS).some(o => o.value === expr[expr.length-1])
  }

  private isFloat(str: string): boolean {
    return str.includes('.')
  }

  private isLessThanLimit(value: string = this.currentValue, limit: number = DIGIT_LIMIT): boolean {
    return value.length < limit
  }
}
