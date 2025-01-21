export default class SelectableTableRow {

	static initialize() {
		var inSelectableClick = false;
		$('body').on('click', '.selectable', event => {
			var $target = $(event.target);
			if (!inSelectableClick && !$target.closest('a').length) {
				inSelectableClick = true;
				$target.find('a').eq(0).click();
				inSelectableClick = false;
			}
		})
	}

}
