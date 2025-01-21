module.exports = function() {
	for (var i=0; i<arguments.length; i++) {
		// Skip context arguments
		var value = arguments[i];
		if (value !== null && typeof value === 'object')
			continue;

		if (!value) {
			return false;
		}
	}

	return true;
}
