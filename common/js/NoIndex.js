export default class NoIndex {

	static initialize() {
		$('.js_no-index').each((index, element) => {
			var $element = $(element);
			$element.text($element.attr('data-content'));
		});
	}

}
