import LangUtils from '../LangUtils.js';
import Overlay from '../overlay/Overlay.js';
import WidgetLoader from '../WidgetLoader.js';
import ZeptoUtils from '../ZeptoUtils.js';

import BUTTON_TEMPLATE from './Dialog-button.hbs';
import HEADLINE_TEMPLATE from './Dialog-headline.hbs';
import ICON_TEMPLATE from './Dialog-icon.hbs';

export default class Dialog extends Overlay {

	/**
	 * Creates a new modal dialog.
	 *
	 * Usage as an information message dialog:
	 * Dialog.information('Document saved', 'The document has been saved. You can continue your work now.');
	 *
	 * Usage as a yes-no message dialog (headline, text, positive button name):
	 * Dialog.question('Delete project', 'Are you sure you want to delete the project?',
	 *    false, 'Delete project',
	 *    () => {
	 *       // Do something when user presses the positive button
	 *    });
	 *
	 * Most flexible usage (custom, free-text dialog):
	 * var dialog = new Dialog();
	 * dialog.setHeadline('Please confirm');
	 * dialog.setContentHtml(MY_LIGHTBOX_CONTENT_TEMPLATE());
	 * dialog.addButton(...);
	 */
	constructor() {
		super();
		this.get$Header().append(HEADLINE_TEMPLATE());
	}

	static escapeHtml(plain) {
		plain = plain + '';
		plain = plain.replace(/&/g, '&amp;');
		plain = plain.replace(/>/g, '&gt;');
		plain = plain.replace(/</g, '&lt;');
		plain = plain.replace(/"/g, '&quot;');
		plain = plain.replace(/'/g, '&apos;');
		plain = plain.replace(/\n/g, '<br>');
		plain = plain.replace(/<br> +/g, '<br>');
		plain = plain.replace(/ +<br>/g, '<br>');
		plain = plain.replace(/<br><br>/g, '</p><p>');
		return '<p>' + plain + '</p>';
	}

	static information(headline, message, callback) {
		var dialog = new Dialog();
		dialog.setHeadline(headline);
		dialog.setIcon('info-circle', false);
		dialog.setContentHtml(this.escapeHtml(message));

		dialog.addButton({name: "OK", primary: true});

		if (callback) {
			dialog.addCloseCallback(callback);
		}

		return dialog;
	}

	static question(headline, message, critical, yesButtonName, yesCallback) {
		var dialog = new Dialog();
		dialog.setHeadline(headline);
		dialog.setIcon('question-circle', critical);
		dialog.setContentHtml(this.escapeHtml(message));

		dialog.addButton({name: yesButtonName, primary: true, critical: critical, callback: yesCallback});
		dialog.addButton({name: LangUtils.isGerman() ? 'Abbrechen' : 'Cancel'});

		return dialog;
	}

	static warning(headline, message, callback) {
		var dialog = new Dialog();
		dialog.setHeadline(headline);
		dialog.setIcon('exclamation-triangle', true);
		dialog.setContentHtml(this.escapeHtml(message));

		dialog.addButton({name: "OK", primary: true});

		if (callback) {
			dialog.addCloseCallback(callback);
		}

		return dialog;
	}

	/**
	 * Adds a clickable dialog buttom. Use objects with the following attributes:
	 *
	 * name: (string, required) The label of the button.
	 * primary: (boolean, optional) Whether the button should have primary style (otherwise, it is secondary).
	 * icon: (string, optional) The icon suffix (added to the SVG path "/svg/main.svg#icon-").
	 * callback: (function, optional) The function to call when this button is clicked.
	 */
	addButton(button) {
		var $button = $(BUTTON_TEMPLATE(button));
		this.get$Footer().append($button);

		$button.click(() => {
			if (!this.$overlay.length || !ZeptoUtils.filterVisible($button))
				return;

			if (button.callback && button.callback() == false)
				return;

			this.close();
		});

		this.get$Footer().removeClass('hidden');

		var $buttons = ZeptoUtils.filterVisible(this.$overlay.find('.js_dialog-button'));
		var $primaryButtons = $buttons.filter(':not(.button-secondary)');

		if (!$buttons.filter(':focus').length) {
			$button.find('.js_dialog-button').focus();
		} else if (button.primary && !$primaryButtons.filter('.js_dialog-button :focus').length) {
			$button.find('.js_dialog-button').focus();
		}

		return $button;
	}

	get$Buttons() {
		return this.get$Footer().find('.js_dialog-button');
	}

	setHeadline(headline) {
		this.get$Header().find('.js_dialog-headline').text(headline);
		this._updateHeadlineVisible();
	}

	setIcon(iconName, critical) {
		this.get$Header().find('.js_dialog-icon').html(ICON_TEMPLATE({iconName, critical}));
		this._updateHeadlineVisible();
	}

	_onKey(event) {
		if (event.which == 13) {
			event.preventDefault();
			var $buttons = ZeptoUtils.filterVisible(this.$overlay.find('.js_dialog-button'));
			var $focusButtons = $buttons.filter(':focus');
			var $primaryButtons = $buttons.filter(':not(.button-secondary)');

			if ($focusButtons.length) {
				$($focusButtons[0]).click();
			} else if ($primaryButtons.length) {
				$($primaryButtons[0]).click();
			} else if ($buttons.length) {
				$($buttons[0]).click();
			}
		} else if (event.which == 27) {
			event.preventDefault();
			var $close = ZeptoUtils.filterVisible(this.$overlay.find('.js_overlay-close button'));
			var $buttons = ZeptoUtils.filterVisible(this.$overlay.find('.js_dialog-button'));

			if ($close.length) {
				this.close($close);
			} else if ($buttons.length) {
				$($buttons[$buttons.length-1]).click();
			}
		}
	}

	_updateHeadlineVisible() {
		var $header = this.get$Header();
		var hasHeadline = $header.find('.js_dialog-headline').text().trim() !== '';
		var hasIcon = $header.find('.js_dialog-icon .fa').length > 0;
		$header.toggleClass('hidden', !hasHeadline && !hasIcon);
	}

}
