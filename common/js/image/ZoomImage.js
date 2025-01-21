import Overlay from '../overlay/Overlay.js';

import CONTENT_TEMPLATE from './ZoomImage-content.hbs';
import FOOTER_TEMPLATE from './ZoomImage-footer.hbs';

export default class ZoomImage extends Overlay {

	constructor($link) {
		super();

		this.$overlay.find('.overlay__frame__close').addClass('overlay__frame__close--auto-hide');

		var src = $link.attr('href');
		var title = $link.attr('title') || $link.find('img').attr('title');

		this.get$Content().replaceWith(CONTENT_TEMPLATE({src, title}));
		this.get$Footer().html(FOOTER_TEMPLATE(title));

		var $nextLi;
		if ($link.closest('.image-gallery').length) {
			$nextLi = $link.closest('li').next();
		} else {
			$nextLi = $(undefined);
		}

		this.$overlay.click(event => {
			if (!this.$overlay.length) {
				return;
			}

			if ($nextLi.length && $(event.target).hasClass('js_zoom-image')) {
				var $nextLink = $nextLi.find('a[rel="zoom"]');
				if ($nextLink.length) {
					$nextLink.click();
					return;
				}
			}

			this.close();
		});
	}

	static initialize() {
		$('body').on('click', 'a[rel="zoom"]', event => {
			event.preventDefault();

			var $otherOverlays = $('.js_overlay');
			new ZoomImage($(event.currentTarget));

			window.setTimeout(() => {
				$otherOverlays.trigger('close');
			}, 200);
		});
	}

}
