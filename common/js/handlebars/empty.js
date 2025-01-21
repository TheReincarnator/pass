module.exports = value => {
	if (value == null)
		return true;

	var type = typeof(value);
	if (type === 'undefined')
		return true;

	if (type === 'string' || value.constructor === Array)
		return value.length == 0;

	if (type === 'object')
		return value.constructor !== Date && Object.keys(value).length === 0;

	return false;
}
