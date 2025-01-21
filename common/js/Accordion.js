export default class Accordion {

	static initialize() {
		$('.accordion__item__toggle').click(event => {
			var $item = $(event.currentTarget).closest('.accordion__item');
			var $accordion = $item.closest('.accordion');

			if (!$accordion.hasClass('accordion--multi')) {
				var wasOpen = $item.hasClass('accordion__item--open');
				$accordion.find('.accordion__item').removeClass('accordion__item--open');
				$item.toggleClass('accordion__item--open', !wasOpen);
			} else {
				$item.toggleClass('accordion__item--open');
			}
		});
	}

}
