module.exports = function() {
	var sum = 0;

	$.each(arguments, (index, value) => {
		if (typeof value == 'number') {
			sum += value;
		}
	});

	return sum;
}
