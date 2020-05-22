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

      const updatedValues = this.updateValuesWithNewDigit(digit, this.currentValue)
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
    this.expression = this.isEqualsPressed() ?
      this.currentValue + o : // Pressing an operator immediately following = should start a new calculation that operates on the result of the previous evaluation.
      this.expression.length === 0 ?
        (o === OPERATORS.add.value || o === OPERATORS.subtract.value) ?
          this.expression + o :
          this.expression : // can't use * or / to start an operation
        this.isPreviousSymbolAnOperator() ?
          this.handleOperatorsSerie(this.expression, o) :
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

  // TODO: refactor
  // TODO: extract to a service? 
  private updateValuesWithNewDigit(digit: number, currValue: string): AppState {

    const updateState = (currentValue: string, expression: string): AppState => ({ currentValue, expression })

    const handleInteger = (num: string, expr: string): AppState => ({
      currentValue: `${parseInt(num)}`, // remove excess zeros at the beginning of the string with parseInt: 01 ==> 1
      expression: this.isPreviousSymbolAnOperator() ?
        expr + num :
        expr.replace(APP_REGEX.lastNumInExpression, `${parseInt(num)}`) 
    })

    return this.isEqualsPressed() ?
      updateState(`${digit}`, `${digit}`) : // start new calculation
      this.isFloat(currValue + digit) ?
        updateState(currValue + digit, this.expression + digit) :
        handleInteger(currValue + digit, this.expression)
  }

  // TODO: refactor
  // TODO: extract to a service? 
  private handleOperatorsSerie(expression: string, operator: string): string {

    const isSubtract = (o: string): boolean => o === OPERATORS.subtract.value
    const isSerie = (str: string): boolean => APP_REGEX.operatorsSerie.test(str)

    if (isSubtract(operator)) {
      return isSubtract(expression[expression.length-1]) ?
        // 1. don't add second subtract operator (-- ==> -) 
        expression : 
        // 2. let subtract operator follow another operator (*- ==> *-)
        expression += operator 
    }

    if (isSerie(expression)) {
      // 3. replace triple operator by the last operator (/-+ ==> +)
      return expression.replace(APP_REGEX.operatorsSerie, operator) 
    } 
    
    if (!isSubtract(operator)) {
      // 4. replace preceding operator (/*, +*, -*, ** ==> *)
      return expression.substring(0, expression.length-1) + operator 
    }
  }
}
