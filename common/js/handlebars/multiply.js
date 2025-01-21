module.exports = function() {
	var sum = 1;

	$.each(arguments, (index, value) => {
		if (typeof value == 'number') {
			sum *= value;
		}
	});

	return sum;
}
