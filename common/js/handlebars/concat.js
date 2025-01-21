module.exports = function() {
	var strings = Array.prototype.slice.call(arguments, 0);
	strings.pop();
	return strings.join('');
}
