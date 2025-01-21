const ARGUMENT_SYNOPSIS = 'Use an optional parameters object, '
	+ 'an optional success function, and an optional error function only';

export default class Ajax {

	static initialize() {
		$.ajaxSettings = $.extend($.ajaxSettings, {
			traditional: true
		});
	}

	static get(path, ...args) {
		var [parameters, successCallback, errorCallback] = this._parseArguments(args);

		if (!path.match(/^\//)) {
			path = '/' + path;
		}

		this._ajax({
			url: path,
			type: 'GET',
			contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		}, parameters, successCallback, errorCallback);
	}

	static rpc(relativePath, ...args) {
		var [parameters, successCallback, errorCallback] = this._parseArguments(args);

		if (!relativePath.match(/^\//)) {
			relativePath = '/' + relativePath;
		}

		var formData = {};
		if (parameters) {
			$.each(parameters, (key, value) => {
				formData[key] = Ajax._marshallParameter(value);
			});
		}

		this._ajax({
			url: '/rpc' + relativePath,
			type: 'POST',
			contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		}, formData, result => {
			if (successCallback) {
				successCallback(Ajax._unmarshallValue(result));
			}
		}, errorCallback);
	}

	static _ajax(opts, data, successCallback, errorCallback) {
		if (window.reddotmode && !(opts.url && opts.url.match(/^\/CMS.*$/))) {
			console.info('In OpenText, all backend calls and some functions are disabled (URL was ', opts.url + ')');
			return;
		}

		opts.data = data;
		opts.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
		opts.success = successCallback;

		if (errorCallback) {
			opts.error = (xhr, textStatus, errorThrown) => {
				var code;
				if (xhr.status)
					code = xhr.status;
				else
					code = 0;

				var text = '';
				if (xhr && xhr.responseText && xhr.responseText.toLowerCase().indexOf('<html>') < 0)
					text = xhr.responseText;
				else if (xhr && xhr.statusText)
					text = xhr.statusText;
				else if (errorThrown)
					text = errorThrown;

				errorCallback({code: code, text: text});
			}
		}

		opts.complete = (xhr, status) => {
			$('body').trigger('ajaxComplete', {
				status: status,
				xhr: xhr,
				opts: opts
			});
		};

		return $.ajax(opts);
	}

	static _marshallDate(date) {
		return '\u231A' + date.toString('yyyyMMdd-HHmmss');
	}

	static _marshallObject(object, stringify) {
		if (object instanceof Date) {
			return Ajax._marshallDate(object);
		} else if ($.isArray(object)) {
			var result = [];
			$.each(object, (index, element) => {
				result.push(Ajax._marshallObject(element, false));
			});
			return stringify ? JSON.stringify(result) : result;
		} else if ($.isPlainObject(object)) {
			var result = {};
			$.each(object, (key, object) => {
				result[key] = Ajax._marshallObject(object, false);
			});
			return stringify ? JSON.stringify(result) : result;
		} else {
			return object;
		}
	}

	static _marshallParameter(value, inArray) {
		if (value == null || typeof(value) == 'undefined') {
			return null;
		}

		if (value instanceof Date) {
			return Ajax._marshallDate(value);
		} else if ($.isArray(value)) {
			var result = [];
			$.each(value, (index, element) => {
				result.push(Ajax._marshallObject(element, true));
			});
			return result;
		} else if ($.isPlainObject(value)) {
			return Ajax._marshallObject(value, true);
		} else {
			return value;
		}
	}

	static _unmarshallValue(data) {
		if (data == null || typeof(data) == 'undefined') {
			return null;
		}

		if (typeof(data) == 'string') {
			if (data[0] == '\u231A') {
				return Date.parseExact(data.substring(1), 'yyyyMMdd-HHmmss');
			} else {
				return data;
			}
		} else if ($.isArray(data)) {
			var result = [];
			$.each(data, (index, element) => {
				result.push(Ajax._unmarshallValue(element));
			});
			return result;
		} else if ($.isPlainObject(data)) {
			var result = {};
			$.each(data, (key, value) => {
				result[key] = Ajax._unmarshallValue(value);
			});
			return result;
		} else {
			return data;
		}
	}

	static _parseArguments(args) {
		var parameters = null;
		var successCallback = null;
		var errorCallback = null;

		$.each(args, (index, argument) => {
			if (argument == null || typeof(argument) == 'undefined')
				return true;

			if (typeof(argument) == 'function') {
				if (errorCallback != null) {
					console.error('Too many arguments to an Ajax call');
					console.error(ARGUMENT_SYNOPSIS);
				} else if (successCallback != null) {
					errorCallback = argument;
				} else {
					successCallback = argument;
				}
			} else if ($.isPlainObject(argument)) {
				if (parameters != null) {
					console.error('Too many arguments to an Ajax call');
					console.error(ARGUMENT_SYNOPSIS);
				} else {
					parameters = argument;
				}
			} else {
				console.error('Invalid argument "' + argument + '" (type ' + typeof(argument) + ') to an Ajax call');
				console.error(ARGUMENT_SYNOPSIS);
			}
		});

		return [parameters, successCallback, errorCallback];
	}

}
