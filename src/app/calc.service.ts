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

  private parseMathExpression(str: string, reg: RegExp): string {
    let res = str
    while(reg.test(res)) {
      res = res.replace(reg, (match, preceedingOperators, firstOperand, p3, operator, secondOperand, p6, offset, string) => {
        const { firstOperator, secondOperator } = this.parsePreceedingOperators(preceedingOperators, match, string)
        return firstOperator + this.mathItUp()[operator](
          Number(`${secondOperator}${firstOperand}`), // Number() handles positive/negative integers and float numbers
          Number(secondOperand)) 
      })
    }
    return res
  }

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
