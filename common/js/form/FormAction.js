import ButtonUtils from '../ButtonUtils.js';
import Form from './Form.js';
import MessageUtils from '../MessageUtils.js';

export default class FormAction {

	constructor(event) {
		event.preventDefault();

		this.$form = $(event.target);
		if (!this.$form.is('form')) {
			this.$form = this.$form.closest('form');
		}

		this.$button = $(event.target);
		if (!this.$button.is('button')) {
			this.$button = this.$form.find('[type="submit"]');
		}
	}

	error(message, error /*(optional)*/) {
		ButtonUtils.setState(this.$button, 'none');
		MessageUtils.error(this.$form.find('.js_messages'), message, error);
	}

	find(selector) {
		return this.$form.find(selector);
	}

	findField(fieldName) {
		return this.find('[name=' + fieldName + ']');
	}

	ok(message /*(optional*/) {
		ButtonUtils.setState(this.$button, 'success');
		if (message) {
			MessageUtils.ok(this.$form.find('.js_messages'), message);
		}
	}

	wait(message /*(optional*/) {
		ButtonUtils.setState(this.$button, 'active');
		if (message) {
			MessageUtils.ok(this.$form.find('.js_messages'), message);
		}
	}

	_execute(callback) {
		if (Form.validate(this.$form).length) {
			ButtonUtils.setState(this.$button, 'none');
			return;
		}

		this.wait();
		callback(this);
	}

}
