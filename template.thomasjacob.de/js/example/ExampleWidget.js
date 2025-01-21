import Ajax from "../../../../common/js/Ajax.js";
import Form from "../../../../common/js/form/Form.js";
import Widget from "../../../../common/js/Widget.js";

import RESULT_TEMPLATE from "./ExampleWidget.hbs";

export default class ExampleWidget extends Widget {
	constructor($widget) {
		super($widget);

		Form.onSubmit($widget, action => {
			$widget.find(".js_result").empty();

			let a = action.findField("a").val();
			let b = action.findField("b").val();

			// As an RPC call:
			/*
			Ajax.rpc('/calculate', {a: a, b: b}, result => {
				$widget.find('.js_result').html(RESULT_TEMPLATE(result));
			});
			*/

			// As a JS function (simulating delay):
			window.setTimeout(() => {
				action.ok();
				let result = parseInt(a, 10) + parseInt(b, 10);
				$widget.find(".js_result").html(RESULT_TEMPLATE(result));
			}, 1000);
		});
	}
}
