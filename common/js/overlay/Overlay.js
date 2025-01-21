import WidgetLoader from '../WidgetLoader.js';
import ZeptoUtils from '../ZeptoUtils.js';

import OVERLAY_TEMPLATE from './Overlay.hbs';
import SHIM_TEMPLATE from './Overlay-shim.hbs';

export default class Overlay {

	/**
	 * Creates a modal overlay, e.g. a dialog or zoom image overlay.
	 * Typically, you use these subclasses, not the superclass itself.
	 */
	constructor() {
		Overlay._ensureShim();
		this._ensureOverlay();

		this.$overlay.on('click', '.js_overlay-close button', event => {
			var $button = $(event.currentTarget);
			if (!this.$overlay.length || !ZeptoUtils.filterVisible($button))
				return;

			this.close($button);
		});

		$(document).on('keydown', $.proxy(this._onKey, this));
	}

	addCloseCallback(callback) {
		this.$overlay.on('closing', callback);
	}

	close($element) {
		var closingContext = {
			element: $element,
			cancel: $element != null && $element.closest('.js_overlay-close').length > 0,
			veto: false
		};
		this.$overlay.trigger('closing', closingContext);
		if (closingContext.veto) {
			return;
		}

		this._closeOverlay();
		$(document).off('keydown', $.proxy(this._onKey, this));
	}

	get$Content() {
		return this.$overlay.find('.js_overlay-content');
	}

	get$Header() {
		return this.$overlay.find('.js_overlay-header');
	}

	get$Footer() {
		return this.$overlay.find('.js_overlay-footer');
	}

	setCloseable(closeable) {
		this.$overlay.find('.js_overlay-close').toggle(closeable);
	}

	setContentHtml(html) {
		this.get$Content().html(html);
	}

	static _closeShim() {
		var $shim = $('.js_overlay-shim');
		if (!$shim.length) {
			return;
		}

		$shim.css('opacity', 0);

		window.setTimeout(() => {
			if (!$('.js_overlay:not(.js_overlay-closing)').length) {
				$shim.remove();
			}
		}, 200);
	}

	static _ensureShim() {
		var $shim = $('.js_overlay-shim');
		if (!$shim.length) {
			$shim = $(SHIM_TEMPLATE());
			$('body').append($shim);

			window.setTimeout(() => {
				$shim.css('opacity', 1);
			}, 0);
		} else {
			$shim.css('opacity', 1);
		}
	}

	_closeOverlay() {
		if (!this.$overlay.length) {
			return;
		}

		var $overlay = this.$overlay;
		this.$overlay = $(undefined);

		$overlay.addClass('js_overlay-closing');
		$overlay.css('opacity', 0);

		window.setTimeout(() => {
			$overlay.remove();
		}, 200);

		if (!$('.js_overlay:not(.js_overlay-closing)').length) {
			Overlay._closeShim();
		}
	}

	_ensureOverlay() {
		if (!this.$overlay || !this.$overlay.length) {
			this.$overlay = $(OVERLAY_TEMPLATE());
			$('body').append(this.$overlay);

			window.setTimeout(() => {
				this.$overlay.css('opacity', 1);
			}, 100);

			this.$overlay.on('close', () => {
				this.close();
			});
		} else {
			this.$overlay.css('opacity', 1);
		}

		$(':focus').blur();
	}

	_onKey(event) {
		event.preventDefault();

		if (event.which == 27) {
			var $close = ZeptoUtils.filterVisible(this.$overlay.find('.js_overlay-close button'));
			if ($close.length) {
				this.close($close);
			}
		}
	}

}
