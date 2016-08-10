var acceptedLength = 12; // max length that can be displayed on the calculator screen
var stringToOperate = ''; // string to show
var tmpNum = ''; // temporary variable to track a decimal. We can adjust as many numbers as we want but only until an operator button is clicked
var acceptedOperators = ['+', '-', '*', '/', '%'];
var result = 0; // result of math operations
var equalClicked = false; // to empty stringToOperate when a number is clicked right after equal button

console.log(equalClicked);
// NUMBER OR DECIMAL is clicked
$('.num').click(function() {

    if(equalClicked === false) {
        if(stringToOperate.length == acceptedLength) {
            tmpNum = '';
            stringToOperate = '';
            insertToScreen('0');
        }
        else {
            var oneMoreNum = $(this).text();
            // check if clicked number is a valid digit
            if(isNumeric(parseInt(oneMoreNum))) {

                tmpNum += oneMoreNum;
                stringToOperate += oneMoreNum;
                insertToScreen(stringToOperate);
            }
        }
    }
    else {
        equalClicked = false;
        var firstNum = $(this).text();
        // check if clicked number is a valid digit
        if(isNumeric(parseInt(firstNum))) {

            tmpNum = firstNum;
            stringToOperate = firstNum;
            insertToScreen(stringToOperate);
        }
    }

});


// OPERATOR is clicked
$('.operator').click(function() {

    console.log(stringToOperate);
    if(stringToOperate.length < acceptedLength) {
        // check if previous symbol is already an operator and prevent repeating
        if(isNumeric(stringToOperate[stringToOperate.length-1])) {
            // reset tmpNum
            tmpNum = '';
            stringToOperate += $(this).text();
            insertToScreen(stringToOperate);
        }
    }
    equalClicked = false;
});

// DECIMAL is clicked
$('#decimal').click(function() {

    if(tmpNum.includes('.') == false) {
        stringToOperate += '.';
        tmpNum += '.';
        insertToScreen(stringToOperate);
    }
});

// EQUAL is clicked
$('#equal').click(function(){
    //the most important here is
    //the method eval() that parses a string for me!
    result = eval(stringToOperate);

    if(result.length <= acceptedLength) {
        insertToScreen(result);
        if(result == 0) {
            stringToOperate = '0';
        }
        else {
            stringToOperate = '' + result;
        }
        equalClicked = true;
    }
    else {
        tmpNum = '';
        stringToOperate = '';
        insertToScreen('Err');
    }
});


/*
AC is clicked
so we shoul clear the screen and stringToOperate as well
*/
$('#clearAll').click(function() {
	result = 0;
	stringToOperate = '';
	insertToScreen(result);
});

/*
CE is clicked
so we should remove one symbol from stringToOperate
*/
$('#clearOne').click(function() {
	var temporaryStr = $('#screen').text();
	var stringToInsert = temporaryStr.slice(0, temporaryStr.length-1);
    stringToOperate = stringToInsert;
	insertToScreen(stringToOperate);
});

/**
 * Function to determine if the last character is an operator or not
 * @param {Number} num
 * @return {Bool} true if num isn't digit
 */
function isNumeric(num) {
  return !isNaN(parseFloat(num)) && isFinite(num);
}

/**
 * Appends a string to a certain div
 * @param {String} data
 */
function insertToScreen(data) {
	$('#screen').text(data);
}
