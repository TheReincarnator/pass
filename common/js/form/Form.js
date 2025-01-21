import FormAction from './FormAction.js';
import LangUtils from '../LangUtils.js';
import Money from '../Money.js';
import ZeptoUtils from '../ZeptoUtils.js';

import MESSAGE_TEMPLATE from './Form-message.hbs';
import MESSAGES_TEMPLATE from './Form-messages.hbs';

export default class Form {

	static onButton($button, selector /*(optional)*/, callback) {
		var args = [];

		if (typeof(selector) === 'string') {
			args.push(selector);
		} else {
			callback = selector;
		}

		args.push(event => {
			new FormAction(event)._execute(callback);
		});

		$button.on('click', ...args);
	}

	static onSubmit($form, selector /*(optional)*/, callback) {
		var args = [];

		if (typeof(selector) === 'string') {
			args.push(selector);
		} else {
			callback = selector;
		}

		args.push(event => {
			new FormAction(event)._execute(callback);
		});

		$form.on('submit', ...args);
	}

	static removeFieldErrors($inputs) {
		$inputs.removeClass('has-error');
		$inputs.find('.input-message').remove();
	}

	static showFieldError(error) {
		var $field = error.$field;
		var $input = $field.closest('.form__input');
		if ($input.length) {
			$input.addClass('has-error');

			if (!$input.hasClass('form__input--no-label')) {
				$input.append(MESSAGE_TEMPLATE(error));
			}

			$input.find('input,select,textarea').one('focus', () => {
				Form.removeFieldErrors($input);
			});
		} else {
			$field.addClass('has-error');
			$field.one('focus', () => {
				Form.removeFieldErrors($field);
			});
		}
	}

	static validate($form, $messages) {
		Form.removeFieldErrors($form.find('.form__input,input,textarea,select'));

		var lang = LangUtils.getLang();

		var errors = [];
		$form.find('[data-validate]').each((index, field) => {
			var $field = $(field);
			if (!ZeptoUtils.isVisible($field))
				return true;
			if (!$field.is('input,select,textarea'))
				return true;

			var $input = $field.closest('.form__input');

			var value = $field.val();
			if (value == null || typeof(value) == 'undefined') {
				value = '';
			} else {
				value = value.toString();
			}

			if ($field.is('[type="checkbox"]:not(:checked)')) {
				value = '';
			}

			var label = $field.attr('data-label');
			if (!label)
				label = $input.find('.label').text();
			if (!label)
				label = $field.attr('name');
			if (label) {
				label = label.replace(/:$/, '');
			}

			var validatorIds = $field.attr('data-validate').split(',');
			$.each(validatorIds, (index, validatorId) => {
				validatorId = validatorId.trim();
				if (!validatorId)
					return true;

				var validatorMethodName = '_validate' + validatorId[0].toUpperCase() + validatorId.substring(1);
				var validator = Form[validatorMethodName];
				if (!validator) {
					console.error('Unknown validator "' + validatorId + '"');
					return true;
				}

				var error = validator(value, label, $field, lang);
				if (error) {
					error.$field = $field;
					errors.push(error);

					Form.showFieldError(error);

					return false;
				}
			});
		});

		if (!$messages || !$messages.length) {
			$messages = $form.find('.js_messages');
		}
		$messages.html(MESSAGES_TEMPLATE(errors));

		return errors;
	}

	static _validateLength(value, label, $field, lang) {
		if (value.trim() == '')
			return null;

		var minlength = $field.attr('data-minlength');
		minlength = minlength !== undefined && minlength !== '' ? parseInt(minlength, 10) : null;
		if (minlength !== null && value.trim().length < minlength) {
			if (lang == 'de') {
				return {
					short: 'Min ' + maxlength + ' Zeichen.',
					long: 'Bitte mindestens ' + maxlength + ' Zeichen in "' + label + '" eingeben.'
				};
			} else {
				return {
					short: 'Min ' + minlength + ' chars.',
					long: 'Please enter at least ' + minlength + ' characters in "' + label + '".'
				};
			}
		}

		var maxlength = $field.attr('data-maxlength');
		maxlength = maxlength !== undefined && maxlength !== '' ? parseInt(maxlength, 10) : null;
		if (maxlength !== null && value.length > maxlength) {
			if (lang == 'de') {
				return {
					short: 'Max ' + maxlength + ' Zeichen.',
					long: 'Bitte höchstens ' + maxlength + ' Zeichen in "' + label + '" eingeben.'
				};
			} else {
				return {
					short: 'Max ' + maxlength + ' chars.',
					long: 'Please enter at most ' + maxlength + ' characters in "' + label + '".'
				};
			}
		}

		return null;
	}

	static _validateMoney(value, label, $field, lang) {
		var lenient;
		if ($field.is('input')) {
			lenient = $field.attr('data-lenient') === 'true';
		} else {
			lenient = $field.find('input').attr('data-lenient') === 'true';
		}
		
		var valueCents = Money.getCentsValue(value, lenient);
		if (valueCents === undefined) {
			if (lang == 'de') {
				return {
					short: 'Ungültig.',
					long: 'Bitte korrigiere deine Eingabe in "' + label + '".'
				};
			} else {
				return {
					short: 'Invalid.',
					long: 'Please provide a valid input in "' + label + '".'
				};
			}
		}

		if (valueCents === '') {
			return;
		}

		var minvalue = $field.attr('data-minvalue');
		var minvalueCents = Money.getCentsValue(minvalue, lenient);
		if (minvalueCents !== undefined && minvalueCents !== '' && valueCents < minvalueCents) {
			if (lang == 'de') {
				return {
					short: 'Min ' + minvalue,
					long: 'Bitte mindestens ' + minvalue + ' in "' + label + '" eingeben.'
				};
			} else {
				return {
					short: 'Min ' + minvalue,
					long: 'Please enter at least ' + minvalue + ' in "' + label + '".'
				};
			}
		}

		var maxvalue = $field.attr('data-maxvalue');
		var maxvalueCents = Money.getCentsValue(maxvalue, lenient);
		if (maxvalueCents !== undefined && maxvalueCents !== '' && valueCents > maxvalueCents) {
			if (lang == 'de') {
				return {
					short: 'Max ' + maxvalue,
					long: 'Bitte höchstens ' + maxvalue + ' in "' + label + '" eingeben.'
				};
			} else {
				return {
					short: 'Max ' + maxvalue,
					long: 'Please enter at most ' + maxvalue + ' in "' + label + '".'
				};
			}
		}
	}

	static _validateNumber(value, label, $field, lang) {
		if (value.trim() == '')
			return null;

		if (!value.match(/^-?[0-9]*$/)) {
			if (lang == 'de') {
				return {
					short: 'Ungültig.',
					long: 'Bitte korrigiere deine Eingabe in "' + label + '".'
				};
			} else {
				return {
					short: 'Invalid.',
					long: 'Please provide a valid input in "' + label + '".'
				};
			}
		}

		var minnumber = $field.attr('data-minnumber');
		minnumber = minnumber !== undefined && minnumber !== '' ? parseInt(minnumber, 10) : null;
		if (minnumber !== null && parseInt(value) < minnumber) {
			if (lang == 'de') {
				return {
					short: 'Min ' + minnumber,
					long: 'Bitte mindestens ' + minnumber + ' in "' + label + '" eingeben.'
				};
			} else {
				return {
					short: 'Min ' + minnumber,
					long: 'Please enter at least ' + minnumber + ' in "' + label + '".'
				};
			}
		}

		var maxnumber = $field.attr('data-maxnumber');
		maxnumber = maxnumber !== undefined && maxnumber !== '' ? parseInt(maxnumber, 10) : null;
		if (maxnumber !== null && parseInt(value) > maxnumber) {
			if (lang == 'de') {
				return {
					short: 'Max ' + maxnumber,
					long: 'Bitte höchstens ' + maxnumber + ' in "' + label + '" eingeben.'
				};
			} else {
				return {
					short: 'Max ' + maxnumber,
					long: 'Please enter at most ' + maxnumber + ' in "' + label + '".'
				};
			}
		}

		return null;
	}

	static _validatePattern(value, label, $field, lang) {
		if (value.trim() == '')
			return null;

		var pattern = new RegExp('^' + $field.attr('data-pattern') + '$');
		if (value.match(pattern) == null) {
			if (lang == 'de') {
				return {
					short: 'Ungültig.',
					long: 'Bitte korrigiere deine Eingabe in "' + label + '".'
				};
			} else {
				return {
					short: 'Invalid.',
					long: 'Please provide a valid input in "' + label + '".'
				};
			}
		}

		return null;
	}

	static _validateRequired(value, label, $field, lang) {
		if (value.trim() == '') {
			if (lang == 'de') {
				return {
					short: 'Pflicht.',
					long: 'Bitte füll das Feld  "' + label + '" aus.'
				};
			} else {
				return {
					short: 'Required.',
					long: 'Please fill out "' + label + '".'
				};
			}
		}

		return null;
	}

}
