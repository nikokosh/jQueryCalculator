export const DIGIT_LIMIT = 9

export const OPERATORS = {
  add: { name: 'add', value: '+'},
  subtract: { name: 'subtract', value: '-'}, 
  multiply: { name: 'multiply', value: '*'},
  divide: { name: 'divide', value: '/'} 
}

export const APP_REGEX = {
  lastNumInExpression: /^$|(?=\*|\+|\/|\-|)(\d+(\.\d+)?)(?!\S)/, // this regex matches an empty string or a number (float or integer) preceeded by a math operator at the end of a string 
  operatorsSerie: /(\+|-|\*|\/){2,}$/, // match two or more operators at the end of the string
  multiplyAndDivide: /([\+|\-]+)?(\d+(\.\d+)?)(\/|\*)(-?\d+(\.\d+)?)/,
  addAndSubtract:    /([\+|\-]+)?(\d+(\.\d+)?)(\+|\-)(-?\d+(\.\d+)?)/,
  addAtStart: /(^\+)(-?\d+(\.\d+)?)/ // matches a plus sign followed by an integer or float num 
}