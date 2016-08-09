var acceptedLength = 10;
var numberToShow = '';
var stringToShow = '';
var tmpNum = '';
var acceptedOperators = ['+', '-', '*', '/'];
var result = 0;

$('.num').click(function() {
    if(stringToShow.length < acceptedLength) {

        var oneMoreNum = $(this).text();
        if(oneMoreNum == '.' && tmpNum.indexOf('.') != -1) {
        }
        else {
            stringToShow += oneMoreNum;
            tmpNum += oneMoreNum;
        	insertToScreen(stringToShow);
        }
    }
});

$('.operator').click(function() {
    if(stringToShow.length < acceptedLength) {
        if(isNumeric(stringToShow[stringToShow.length-1])) {
            tmpNum = '';
            stringToShow += $(this).text();
            insertToScreen(stringToShow);
        }
    }
});


$('#equal').click(function(){
    //the most important here is
    //the method eval() that parses a string for me!
    result = eval(stringToShow);
    insertToScreen(result);
    if(result == 0) {
        stringToShow = '0';
    }
    else {
        stringToShow = '' + result;
    }
});

$('#clearAll').click(function() {
	result = 0;
	stringToShow = '';
	insertToScreen(result);
});

$('#clearOne').click(function() {
	var temporaryStr = $('#screen').text();
	var stringToInsert = temporaryStr.slice(0, temporaryStr.length-1);
    stringToShow = stringToInsert;

	insertToScreen(stringToShow);
});

// function to determine if the last character is an operator or not
function isNumeric(num) {
  return !isNaN(parseFloat(num)) && isFinite(num);
}

function insertToScreen(num) {
	$('#screen').text(num);
}
