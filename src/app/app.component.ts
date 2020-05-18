import { Component } from '@angular/core';
import { DIGIT_LIMIT, OPERATORS } from './constants';

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
  re = {
    lastNumInExpression: /^$|(?=\*|\+|\/|\-|)(\d+(\.\d+)?)(?!\S)/, // this regex matches an empty string or a number (float or integer) preceeded by a math operator at the end of a string 
    operatorsSerie: /(\+|-|\*|\/){2,}$/, // match two or more operators at the end of the string
    multiplyAndDivide: /(((?<=\+|\*|\/|\n|^)-)?\d+(\.\d+)?)(\/|\*)(-?\d+(\.\d+)?)/,
    addAndSubtract: /(((?<=\+|\*|\/|^|\n)-)?\d+(\.\d+)?)(\+|\-)(-?\d+(\.\d+)?)/
  }

  pressDigit(digit: number) {
    if (this.isLastSymbolAnOperator() || this.isLessThanLimit()) {

      if (this.isLastSymbolAnOperator()) this.currentValue = ''

      const updateState = (currentValue: string, expression: string): AppState => ({ currentValue, expression })

      const handleInteger = (num: string, expr: string): AppState => ({
        currentValue: `${parseInt(num)}`, // remove excess zeros at the beginning of the string with parseInt
        expression: this.isLastSymbolAnOperator() ?
          expr + parseInt(num) :
          expr.replace(this.re.lastNumInExpression, `${parseInt(num)}`) 
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
      } else if (this.re.operatorsSerie.test(expression)) {
        return expression.replace(this.re.operatorsSerie, operator) // 3. replace triple operator by the last operator (/-+ ==> +)
      } else if (operator !== OPERATORS.subtract.value) {
        return expression.substring(0, expression.length-1) + operator // 4. replace preceding operator (/*, +*, -*, ** ==> *)
      }
    }

    this.expression = this.isEqualsPressed() ?
      this.currentValue + o : // Pressing an operator immediately following = should start a new calculation that operates on the result of the previous evaluation.
      this.expression.length === 0 ?
        (o === OPERATORS.add.value || o === OPERATORS.subtract.value) ?
          this.expression + o :
          this.expression :
        this.isLastSymbolAnOperator() ?
          handleOperatorsSerie(this.expression, o) :
          this.expression + o
  }

  pressEquals() {
    if (!this.isEqualsPressed()) {
      const result = this.calcResult(this.expression)
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

  private isLastSymbolAnOperator(expr: string = this.expression): boolean {
    return Object.values(OPERATORS).some(o => o.value === expr[expr.length-1])
  }

  private isFloat(str: string): boolean {
    return str.includes('.')
  }

  private isLessThanLimit(value: string = this.currentValue, limit: number = DIGIT_LIMIT): boolean {
    return value.length < limit
  }

  private calcResult(expression: string): string {
    const mathItUp = {
      [OPERATORS.add.value]: (x, y) => x + y,
      [OPERATORS.subtract.value]: (x, y) => x - y,
      [OPERATORS.multiply.value]: (x, y) => x * y,
      [OPERATORS.divide.value]: (x, y) => {
        const countDecimalPlaces = (floatNum: number) => `${floatNum}`.split('.')[1].length
        const result = x / y
        return Number.isInteger(result) ?
          result :
          countDecimalPlaces(result) > 4 ?
            result.toFixed(4) :
            result
      },
    }
    
    const calc = (str: string, reg: RegExp): string => {
      let res = str
      while(reg.test(res)) {
        res = res.replace(reg, (match, firstOperand, p2, p3, operator, secondOperand) => {
          return mathItUp[operator](Number(firstOperand), Number(secondOperand)) // Number() handles positive/negative integers and float numbers
        })
      }
      return res
    }

    /* 
     1. find the first occurency of *, /, *- and /- and digits around them 
     3. replace this occurency with the result of the calculation
     4. find the first occurency of +, -, +- and digits around them
     5. replace this occurency with the result of the calculation
     6. repeat searching from the start till only one last number is left
     */
    let result = calc(expression, this.re.multiplyAndDivide)
    return calc(result, this.re.addAndSubtract)
  }
}
