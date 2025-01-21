module.exports = date => {
	var lang;
	if (typeof($) !== 'undefined')
		lang = $('html').attr('lang') === 'de' ? 'de' : 'en';
	else
		lang = 'de';

	return date ? date.toString(lang === 'de' ? 'd.M.yyyy HH:mm' : 'M/d/yyyy hh:mm tt') : '';
}
