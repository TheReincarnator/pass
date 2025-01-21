import MESSAGE_BOX_TEMPLATE from './MessageUtils.hbs';

export default class MessageUtils {

	static error($container, message, error /*(optional)*/) {
		if (message && error && error.text) {
			message += ': ' + error.text;
		}

		if (message) {
			$container.html(MESSAGE_BOX_TEMPLATE({type: 'error', message: this._formatMessage(message)}));
		} else {
			$container.empty();
		}
	}

	static ok($container, message) {
		if (message) {
			$container.html(MESSAGE_BOX_TEMPLATE({type: 'ok', message: this._formatMessage(message)}));
		} else {
			$container.empty();
		}
	}

	static _formatMessage(plain) {
		plain = plain || '';
		plain = plain.replace(/&/g, '&amp;');
		plain = plain.replace(/>/g, '&gt;');
		plain = plain.replace(/</g, '&lt;');
		plain = plain.replace(/"/g, '&quot;');
		plain = plain.replace(/'/g, '&apos;');
		plain = plain.replace(/\[([^\]|]+)\|((https?:|mailto:|\/)[^\]|]*)\]/g, '<a href="$2">$1</a>');
		plain = plain.replace(/\n/g, '<br>');
		plain = plain.replace(/<br> +/g, '<br>');
		plain = plain.replace(/ +<br>/g, '<br>');
		plain = plain.replace(/<br><br>/g, '</p><p>');
		return plain;
	}

}
