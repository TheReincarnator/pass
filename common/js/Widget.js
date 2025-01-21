import LangUtils from './LangUtils.js';
import ZeptoUtils from './ZeptoUtils.js';

import DE_SPINNER_TEMPLATE from './Widget-spinner-de.hbs';
import EN_SPINNER_TEMPLATE from './Widget-spinner-en.hbs';


export default class Widget {

	constructor($widget) {
		this.$widget = $widget;
		this.className = $widget.attr("data-class");
	}

	hide() {
		this.$widget.addClass('hidden');
	}

	setPageHeadline(text, pageTitleToo = true) {
		$('.js_page-headline').text(text);
		if (pageTitleToo) {
			var pageHeadlineSuffix = $('head meta[name="headline-suffix"]').attr('content');
			this.setPageTitle(pageHeadlineSuffix ? text + pageHeadlineSuffix : text);
		}
	}

	setPageTitle(text) {
		$('head title').text(text);
	}

	show() {
		this.$widget.removeClass('hidden');
	}

	spinner($container /*(optional)*/) {
		if (!$container || !ZeptoUtils.isZepto($container)) {
			$container = this.$widget;
		}

		$container.html(LangUtils.isGerman() ? DE_SPINNER_TEMPLATE() : EN_SPINNER_TEMPLATE());
	}

}
