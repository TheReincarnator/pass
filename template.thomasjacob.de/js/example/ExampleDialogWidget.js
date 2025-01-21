import Ajax from "../../../../common/js/Ajax.js";
import Dialog from "../../../../common/js/dialog/Dialog.js";
import Widget from "../../../../common/js/Widget.js";

import CUSTOM_DIALOG_TEMPLATE from "./ExampleDialogWidget-custom-dialog.hbs";

export default class ExampleDialogWidget extends Widget {
	constructor($widget) {
		super($widget);
		$widget.find(".js_information-dialog").click(() => {
			Dialog.information(
				"Dialog headline",
				"This is the content body.\nThis is a new line.\n\nThis is a new paragraph."
			);
		});

		$widget.find(".js_big-information-dialog").click(() => {
			Dialog.information(
				"Dialog headline",
				"This is the content body.\nThis is a new line.\n\nThis is a new paragraph.\n\n" +
					"This is the content body with a long line that never seems to end.\n\n" +
					"This is the content body.\nThis is a new line.\n\nThis is a new paragraph.\n\n" +
					"This is the content body.\nThis is a new line.\n\nThis is a new paragraph.\n\n" +
					"This is the content body.\nThis is a new line.\n\nThis is a new paragraph."
			);
		});

		$widget.find(".js_warning-dialog").click(() => {
			Dialog.warning(
				"Dialog headline",
				"This is the content body.\nThis is a new line.\n\nThis is a new paragraph."
			);
		});

		$widget.find(".js_question-dialog").click(() => {
			Dialog.question(
				"Dialog headline",
				"Are you sure you want to save the project?",
				false,
				"Save project",
				() => {
					alert("You pressed Yes!");
				}
			);
		});

		$widget.find(".js_critical-question-dialog").click(() => {
			Dialog.question(
				"Dialog headline",
				"Are you sure you want to delete the project?",
				true,
				"Delete project",
				() => {
					alert("You pressed Yes!");
				}
			);
		});

		$widget.find(".js_custom-dialog").click(() => {
			var dialog = new Dialog();
			dialog.setHeadline("This is a custom dialog");
			dialog.setContentHtml(CUSTOM_DIALOG_TEMPLATE());
			// You can also add buttons: dialog.addButton(...);
		});

		$widget.find(".js_custom-dialog-noclose").click(() => {
			var dialog = new Dialog();
			dialog.setHeadline("This is a custom dialog (no close)");
			dialog.setContentHtml(CUSTOM_DIALOG_TEMPLATE());
			dialog.setCloseable(false);
			// You can also add buttons: dialog.addButton(...);
		});
	}
}
