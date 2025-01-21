export default class UrlParser {

	static buildParamsString(params) {
		var paramsString = '';
		$.each(params, (name, value) => {
			if (paramsString)
				paramsString += '&';

			paramsString += encodeURIComponent(name) + '=' + encodeURIComponent(value);
		});

		return paramsString;
	}

	static getParams(/* optional, defaults to window.location */ href) {
		if (!href) {
			href = window.location.href;
		}

		var queryPos = href.indexOf('?');
		if (queryPos < 0)
			return {};

		var params = href.substring(queryPos + 1).split('&');
		var vars = {}
		for (var i = params.length-1; i>= 0; --i) {
			var param = params[i].split('=');
			if (param[0] == null || param[0] == '')
				continue;

			if (param[1]) {
				vars[param[0]] = decodeURIComponent(param[1].replace(/\+/g,  " "));
			} else {
				vars[param[0]] = param[1];
			}
		}

		return vars;
	}

}
