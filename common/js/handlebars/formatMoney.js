module.exports = function(amount, unit) {
	if (!amount && amount !== 0)
		return '';

	var lang;
	if (typeof($) !== 'undefined')
		lang = $('html').attr('lang') === 'de' ? 'de' : 'en';
	else
		lang = 'de';

	var fraction = Math.abs(amount) % 100;
	var integer = (Math.abs(amount) - fraction) / 100;
	return (amount < 0 ? '-' : '')
		+ integer + (lang === 'de' ? ',' : '.')
		+ (fraction < 10 ? '0' : '') + fraction
		+ (unit ? unit : '');
}
