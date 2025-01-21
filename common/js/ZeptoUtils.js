export default class ZeptoUtils {

	static filterVisible($elements) {
		return $elements.filter(function() {
			var $element = $(this);
			return !!($element.width() || $element.height()) && $element.css("display") !== "none";
		});
	}

	static isVisible($elements) {
		return this.filterVisible($elements).length > 0;
	}

	static isZepto(object) {
		return object && object.__proto__ === $.fn;
	}

}
