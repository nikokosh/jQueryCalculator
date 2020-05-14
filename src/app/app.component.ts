import { Component } from '@angular/core';
import { DIGIT_LIMIT, OPERATORS } from './constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  currentValue: string = '0'
  expression: string = ''

  pressDigit(digit: number) {
    if (this.isLessThanLimit()) {
      if (this.isLastSymbolAnOperator()) {
        this.currentValue = ''
      }

      if (this.isEqualsPressed()) {
        this.currentValue = `${digit}`
        this.expression = this.currentValue
      } else {

        let tempValue: string = this.currentValue + digit
        if (this.isFloat(tempValue)) {
          this.currentValue += digit
          this.expression += digit
        } else {
          this.currentValue = `${parseInt(tempValue)}`
          if (this.isLastSymbolAnOperator()) {
            this.expression += parseInt(tempValue)
          } else {
            // this regex matches an empty string or a number (float or integer) preceeded by a math operator at the end of a string 
            const lastDigitInExpression = /^$|(?=\*|\+|\/|\-|)(\d+(\.\d+)?)(?!\S)/
            this.expression = this.expression.replace(lastDigitInExpression, `${parseInt(tempValue)}`) 
          }
        }
      }

    }
  }

  pressDecimal() {
    if (this.isLessThanLimit()) {
      const appendDecimal = () => !this.isFloat(this.currentValue) ? '.' : '' 
      this.expression += appendDecimal()
      this.currentValue += appendDecimal()
    }
  }

  pressOperator(operator: string) {

    this.expression = this.isEqualsPressed() ?
      this.currentValue + operator : // Pressing an operator immediately following = should start a new calculation that operates on the result of the previous evaluation.
      this.isLastSymbolAnOperator() ?
        handleOperatorsSerie(this.expression, operator) :
        this.expression + operator

    /* Four possible ways to handle an operator following immediately another operator */
    function handleOperatorsSerie(expression: string, operator: string): string {
     
      // WARNING: this if should come before triple operator handling in order to handle properly double subtract operator
      if (operator === OPERATORS.subtract.value) {
        return (expression[expression.length-1] === OPERATORS.subtract.value) ?
          expression : // 1. replace subtract operator followed by another subtract operator (-- ==> -) 
          expression += operator // 2. let subtract operator follow another operator (*- ==> *-)
      }

      // 3. replace triple operator by the last operator (/-+ ==> +)
      const operatorsSerie = /(\+|-|\*|\/){2,}$/ // match two or more operators at the end of the string
      if (operatorsSerie.test(expression)) {
        return expression.replace(operatorsSerie, operator)
      }
       
      // 4. replace preceding operator (/*, +*, -*, ** ==> *)
      if (operator !== OPERATORS.subtract.value) {
        return expression.substring(0, expression.length-1) + operator
      }
    }
  }

  pressEquals() {
    const result = this.calcResult(this.expression)
    this.currentValue = result
    this.expression = this.expression + '=' + result
  }

  clear() {
    this.currentValue = '0'
    this.expression = ''
  }

  private isEqualsPressed(expression: string = this.expression): boolean {
    return /=/.test(expression)
  }

  private isLastSymbolAnOperator(): boolean {
    return Object.values(OPERATORS).some(o => o.value === this.expression[this.expression.length-1])
  }

  private isFloat(str: string): boolean {
    return str.includes('.') ? true : false
  }

  private isLessThanLimit(value: string = this.currentValue, limit: number = DIGIT_LIMIT): boolean {
    return value.length < limit ? true : false
  }

  private calcResult(expression: string): string {
    const mathItUp = {
      [OPERATORS.add.value]: (x, y) => x + y,
      [OPERATORS.subtract.value]: (x, y) => x - y,
      [OPERATORS.multiply.value]: (x, y) => x * y,
      [OPERATORS.divide.value]: (x, y) => {
        let result = x / y
        return Number.isInteger(result) ?
          result :
          result.toFixed(4)
      },
    }
    /* 
     1. find all the occurencies of *, /, *- and /- and digits around them 
     2. perform multiply and divide operations in their order from the beginning to the end of the expression
     3. replace multiply and divide operations with the result of these operations
     4. find the first occurency of +, -, +- and digits around them
     5. replace this occurency with the result of the operation
     6. repeat searching from the start till only one number is left
     */
    const multiplyAndDivideRe = /(((?<=\+|\*|\/|\n|^)-)?\d+(\.\d+)?)(\/|\*)(-?\d+(\.\d+)?)/
    const addAndSubtractRe = /(((?<=\+|\*|\/|^|\n)-)?\d+(\.\d+)?)(\+|\-)(-?\d+(\.\d+)?)/
    let result = expression

    while(multiplyAndDivideRe.test(result)) {
      result = result.replace(multiplyAndDivideRe, (match, firstOperand, p2, p3, operator, secondOperand) => {
        // Number() handles positive/negative integers and float numbers
        return mathItUp[operator](Number(firstOperand), Number(secondOperand))
      })
    }

    while(addAndSubtractRe.test(result)) {
      result = result.replace(addAndSubtractRe, (match, firstOperand, p2, p3, operator, secondOperand) => {
        return mathItUp[operator](Number(firstOperand), Number(secondOperand))
      })
    }
    return result
  }
}

// var acceptedLength = 12; // max length that can be displayed on the calculator screen
// var stringToOperate = ''; // string to show
// var tmpNum = ''; // temporary variable to track a decimal. We can adjust as many numbers as we want but only until an operator button is clicked
// var acceptedOperators = ['+', '-', '*', '/', '%'];
// var result = 0; // result of math operations
// var equalClicked = false; // to empty stringToOperate when a number is clicked right after equal button

// //console.log(equalClicked);
// // NUMBER OR DECIMAL is clicked
// $('.num').click(function() {

//     if(equalClicked === false) {
//         if(stringToOperate.length == acceptedLength) {
//             cleanData();
//             insertToScreen('0');
//         }
//         else {
//             var oneMoreNum = $(this).text();
//             // check if clicked number is a valid digit
//             if(isNumeric(parseInt(oneMoreNum))) {

//                 tmpNum += oneMoreNum;
//                 stringToOperate += oneMoreNum;
//                 insertToScreen(stringToOperate);
//             }
//         }
//     }
//     else {
//         equalClicked = false;
//         var firstNum = $(this).text();
//         // check if clicked number is a valid digit
//         if(isNumeric(parseInt(firstNum))) {
//             tmpNum = firstNum;
//             stringToOperate = firstNum;
//             insertToScreen(stringToOperate);
//         }
//     }
// });

// // OPERATOR is clicked
// $('.operator').click(function() {

//     if(stringToOperate.length < acceptedLength) {
//         // check if previous symbol is already an operator and prevent repeating
//         if(isNumeric(stringToOperate[stringToOperate.length-1])) {
//             // reset tmpNum
//             tmpNum = '';
//             stringToOperate += $(this).text();
//             insertToScreen(stringToOperate);
//         }
//     }
//     equalClicked = false;
// });

// // DECIMAL is clicked
// $('#decimal').click(function() {

//     if(tmpNum.includes('.') == false) {
//         stringToOperate += '.';
//         tmpNum += '.';
//         insertToScreen(stringToOperate);
//     }
// });

// // EQUAL is clicked
// $('#equal').click(function(){
//     //the most important here is
//     //the method eval() that parses a string for me!
//     // Math.round to prevent a very long result
//     result = Math.round(eval(stringToOperate) * 100) / 100;
//     resultLength = result.toString().length;
//     console.log('Length: ' + resultLength);
//     if(resultLength <= acceptedLength) {
//         insertToScreen(result);
//         if(result == 0) {
//             stringToOperate = '0';
//         }
//         else {
//             stringToOperate = '' + result;
//         }
//         equalClicked = true;
//     }
//     else {
//         cleanData();
//         insertToScreen('Err');
//     }
// });

// /*
// AC is clicked
// so we shoul clear the screen and stringToOperate as well
// */
// $('#clearAll').click(function() {
// 	result = 0;
// 	cleanData();
// 	insertToScreen(result);
// });

// /*
// CE is clicked
// so we should remove one symbol from stringToOperate
// */
// $('#clearOne').click(function() {
// 	var temporaryStr = $('#screen').text();
// 	var stringToInsert = temporaryStr.slice(0, temporaryStr.length-1);
//     stringToOperate = stringToInsert;

//     if(stringToOperate.length > 0) {
//         insertToScreen(stringToOperate);
//     }
//     else {
//         insertToScreen('0');
//     }
// });

// /**
//  * Function to determine if the last character is an operator or not
//  * @param {Number} num
//  * @return {Bool} true if num isn't digit
//  */
// function isNumeric(num) {
//   return !isNaN(parseFloat(num)) && isFinite(num);
// }

// /**
//  * Function to reset two variables
//  */
// function cleanData() {
//     stringToOperate = '';
//     tmpNum = '';
// }
// /**
//  * Appends a string to a certain div
//  * @param {String} data
//  */
// function insertToScreen(data) {
// 	$('#screen').text(data);
// }
