import { Injectable } from '@angular/core';
import { OPERATORS, APP_REGEX } from './constants';

@Injectable({
  providedIn: 'root'
})
export class CalcService {

  /* 
   1. remove a + operator at the beginning of the expression
   2. find the first occurency of *, /, *- and /- and digits around them 
   3. replace this occurency with the result of the calculation
   4. repeat
   5. find the first occurency of +, -, +- and digits around them
   6. replace this occurency with the result of the calculation
   7. repeat searching from the start till only one last number is left
   */
  calc(expression: string): string {
    let result = this.removeAddAtTheStart(expression, APP_REGEX.addAtStart)
    result = this.parseMathExpression(result, APP_REGEX.multiplyAndDivide)
    return this.parseMathExpression(result, APP_REGEX.addAndSubtract)
  }

  /* 
  Regex matches preceeding operator(s) 
  then a number (integer or float) 
  then an operator (between two numbers) 
  then another number (integer or float)
  */
  private parseMathExpression(str: string, reg: RegExp): string {

    /* 
    For example, the expression is 3+-3*-2
    First match is +-3*2
    Preceeding operators: +-
    First operand: 3
    Operator: *
    Second operand: -2 
    Replace function returns +6, 
    */
    const findAndExecuteOperation = (expr: string, regexp: RegExp) => {
      return expr.replace(regexp, (match, preceedingOperators, firstOperand, p3, operator, secondOperand, p6, offset, string) => {
        const { firstOperator, secondOperator } = this.parsePreceedingOperators(preceedingOperators, match, string)
        return firstOperator + this.mathItUp()[operator](
          Number(`${secondOperator}${firstOperand}`), // Number() handles positive/negative integers and float numbers
          Number(secondOperand)) 
      })
    }

    let res = str
    while(reg.test(res)) {
      res = findAndExecuteOperation(res, reg)
    }
    return res
  }

  /*
  Four different cases:
  - operators serie: 1+-3*2
    first operator will be +
    second will be -

  - only one operator after a digit: 1-3*2 
    first operator: 0
    second: none

  - only one operator at the beginning of the string: -3*2
    first operator: none
    second: -

  - no operators at all: 3*2
    first operator: none
    second: none
  */
  private parsePreceedingOperators(operators: string, mathExpr: string, string: string) {

    const isOperatorsSerie = (str: string = ''): boolean => str.length > 1
    const createRegexFromMathExpr = (expr: string): string => expr.replace(/(\*|\/|\+|\-)/g, '\\$1')
    const isBeforeADigit = (search: string, str: string): boolean => new RegExp(`\\d(?=${createRegexFromMathExpr(search)})`).test(str)

    return {
      firstOperator: isOperatorsSerie(operators) || isBeforeADigit(mathExpr, string) ? operators[0] : '',
      secondOperator: isOperatorsSerie(operators) ?
        operators[1] :
        isBeforeADigit(mathExpr, string) || !operators ?
          '' :
          operators[0]
    }
  }

  private mathItUp() {
    return {
      [OPERATORS.add.value]: (x, y) => x + y,

      [OPERATORS.subtract.value]: (x, y) => x - y,

      [OPERATORS.multiply.value]: (x, y) => x * y,

      /* let an integer be as it is or round a float number to maximum four decimal places of precision: 
      2.25 ==> 2.25
      3.33333333 ==> 3.3333 */
      [OPERATORS.divide.value]: (x, y) => {

        const countDecimalPlaces = (floatNum: number) => `${floatNum}`.split('.')[1].length
        const result = x / y
        return Number.isInteger(result) ?
          result :
          countDecimalPlaces(result) > 4 ?
            result.toFixed(4) :
            result
      }
    }
  }

  private removeAddAtTheStart(str: string, reg: RegExp): string {
    return str.replace(reg, `$2`)
  }
}
