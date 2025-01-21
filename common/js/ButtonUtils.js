export default class ButtonUtils {
	/**
	 * @param state One of 'none', 'active', 'success', and 'disabled'.
	 */
	static setState($buttonOrButtons, state) {
		$buttonOrButtons.each((index, button) => {
			var $button = $(button);
			var $icon = $button.find(".fa");
			var originalIconClass = $button.attr("data-original-icon-class");
			if (originalIconClass === null) {
				originalIconClass = $icon.length ? $icon.attr("class") : "";
				$button.attr("data-original-icon-class", originalIconClass);
			}

			if (state == "none" || state == "disabled") {
				if (originalIconClass) {
					$icon.attr("class", originalIconClass);
				} else {
					$icon.remove();
				}

				$button.prop("disabled", state == "disabled");
			} else {
				if (!$icon.length) {
					$icon = $('<i class="button__state-icon"></i>');
					$button.append($icon);
				}
				var ownIcon = $icon.hasClass("button__state-icon");

				if (state == "success") {
					$icon.attr("class", "fa fa-check");

					window.setTimeout(() => {
						this.setState($button, "none");
					}, 3000);
				} else {
					// state == 'active'
					$icon.attr("class", "fa fa-cog fa-spin");
				}

				if (ownIcon) {
					$icon.addClass("button__state-icon");
				}

				$button.prop("disabled", true);
			}
		});
	}
}
