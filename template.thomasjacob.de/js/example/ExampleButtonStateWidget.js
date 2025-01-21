import Ajax from "../../../../common/js/Ajax.js";
import ButtonUtils from "../../../../common/js/ButtonUtils.js";
import Dialog from "../../../../common/js/dialog/Dialog.js";
import Widget from "../../../../common/js/Widget.js";

import CUSTOM_DIALOG_TEMPLATE from "./ExampleDialogWidget-custom-dialog.hbs";

export default class ExampleButtonStateWidget extends Widget {
	constructor($widget) {
		super($widget);
		$widget.find(".js_click-button").click(event => {
			var $button = $(event.currentTarget);
			ButtonUtils.setState($button, "active");
			window.setTimeout(() => {
				ButtonUtils.setState($button, "none");
			}, 1500);
		});

		$widget.find(".js_click-confirm-button").click(event => {
			var $button = $(event.currentTarget);
			ButtonUtils.setState($button, "active");
			window.setTimeout(() => {
				ButtonUtils.setState($button, "success");
			}, 1500);
		});
	}
}
