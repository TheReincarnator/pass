module.exports = value => {
	if (value == null)
		return 0;

	var type = typeof(value);
	if (type === 'undefined')
		return 0;

	if (type === 'string' || value.constructor === Array)
		return value.length;

	if (type === 'object')
		return value.constructor !== Date && Object.keys(value).length;

	return 0;
}
