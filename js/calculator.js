var numberToShow = "";

var numberToOperate;

var operation;
var result = 0;

var sum = false;
var subst = false;
var mult = false;
var division = false;
var modulo = false;


$('.num').click(function() {
	var oneMoreNum = $(this).text();
	numberToShow += oneMoreNum;
	insertToScreen(numberToShow);
});

$('.operator').click(function() {
	

	console.log('Result before calcul: ' + result);

	

	if (result == 0) {
		numberToOperate = parseInt($('#screen').text());
		result = numberToOperate;
		operation = $(this).text();
	}
	else {

		if(numberToOperate == "afterEqual") {
			numberToOperate = "";
			console.log('After equal');
			operation = $(this).text();
		}
		else {

			numberToOperate = parseInt(numberToShow);
			chooseOperator();
			calculate(result, numberToOperate);
			operation = $(this).text();
		}	
	}

	console.log('Result is: ' + result);
	
	insertToScreen(operation);

	numberToShow = ""; //needed in this positiion
	
});


$('#equal').click(function(){
	console.log('Result before calcul: ' + result);
	numberToOperate = parseInt(numberToShow); //need to get a fresh number
	chooseOperator();
	calculate(result, numberToOperate);
	insertToScreen(result);
	numberToOperate = "afterEqual";
	console.log('Result is: ' + result);
});

$('#clearAll').click(function() {
	firstNumber = 0;
	secondNumberToOperate = 0;
	result = 0;
	keepInMind = 0;
	numberToShow = "";
	insertToScreen(numberToShow);
});

$('#clearOne').click(function() {
	var temporaryStr = $('#screen').text();
	var stringToInsert = temporaryStr.slice(0, temporaryStr.length-1);
	console.log(stringToInsert);
	insertToScreen(stringToInsert);
});

function insertToScreen(num) {
	$('#screen').text(num);
}

function calculate(one, two) {
	if (sum) {
		result = one + two;
		sum = false;
	}
	else if (subst) {
		result = one - two;
		subst = false;
	}
	else if (mult) {
		result = one * two;
		mult = false;
	}
	else if (division) {
		result = one / two;
		division = false;
	}
	else if (modulo) {
		result = one % two;
	}
}

function chooseOperator() {
	if (operation == "+") {
		sum = true;
	}

	else if (operation == "-") {
		subst = true;
	}

	else if (operation == "*") {
		mult = true;
	}

	else if (operation == "/") {
		division = true;
	}
	else if (operation == "%") {
		modulo = true;
	}
}