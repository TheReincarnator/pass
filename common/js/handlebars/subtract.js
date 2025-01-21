module.exports = function() {
	var sum = null;

	$.each(arguments, (index, value) => {
		if (typeof value == 'number') {
			if (sum == null) {
				sum = value;
			} else {
				sum -= value;
			}
		}
	});

	return sum;
}
