module.exports = function(count, options) {
	var result = '';
	for (var i = 0; i < count; i++) {
		result += options.fn(options, {index: i});
	}
	return result;
}
