import LangUtils from "./LangUtils.js";
import ZeptoUtils from "./ZeptoUtils.js";

export default class Money {
	static initialize() {
		$("input.input--money:not(.input--money-handler)").each((index, input) => {
			var $input = $(input);
			$input.addClass("input--money-handler");

			$input.blur(() => {
				var text = $input.val();
				var cleanedUpText = Money.cleanupValue(
					text,
					$input.attr("data-lenient") === "true"
				);
				if (cleanedUpText !== undefined) {
					$input.val(cleanedUpText);
				}
			});
		});
	}

	static cleanupValue(text, lenient) {
		if (ZeptoUtils.isZepto(text)) {
			text = text.val();
		}

		var value = Money.getCentsValue(text, lenient);
		if (value === undefined || value === "") {
			return value;
		}

		var text = new String(Math.abs(value));
		while (text.length < 3) text = "0" + text;
		if (value < 0) text = "-" + text;

		var german = LangUtils.isGerman();
		var last = true;
		for (var i = text.length - 2; i > 0; i -= 3) {
			text = text.substr(0, i) + (german == last ? "," : ".") + text.substr(i);
			last = false;
		}

		return text;
	}

	static getCentsValue(text, lenient) {
		if (ZeptoUtils.isZepto(text)) {
			text = text.val();
		}

		if (text === undefined || text === null) text = "";
		text = text.trim();
		text = text.replace(/\s*€$/, "");

		if (text.length === 0) {
			return "";
		}

		if (lenient) {
			text = text.replace(/[,.]$/, "");
		}

		var value = undefined;

		if (text.match(/^[+-]?[0-9]{0,2}(\.?[0-9]{3})*(,[0-9]{2}|)$/)) {
			value = parseFloat(text.replace(".", "").replace(",", "."));
		} else if (text.match(/^[+-]?[0-9]{0,2}(,?[0-9]{3})*(\.[0-9]{2}|)$/)) {
			value = parseFloat(text.replace(",", ""));
		}

		if (value === undefined && lenient) {
			if (text.match(/^[+-]?[0-9]{0,2}(\.?[0-9]{3})*,[0-9]$/)) {
				value = parseFloat(text.replace(".", "").replace(",", ".") + "0");
			} else if (text.match(/^[+-]?[0-9]{0,2}(,?[0-9]{3})*\.[0-9]$/)) {
				value = parseFloat(text.replace(",", "") + "0");
			}
		}

		return value !== undefined ? Math.round(value * 100) : undefined;
	}

	static setCentsValue($text, amount) {
		if (!amount && amount !== 0) $text.val("");

		var lang;
		if (typeof $ !== "undefined")
			lang = $("html").attr("lang") === "de" ? "de" : "en";
		else lang = "de";

		var fraction = Math.abs(amount) % 100;
		var integer = (Math.abs(amount) - fraction) / 100;
		$text.val(
			(amount < 0 ? "-" : "") +
				integer +
				(lang === "de" ? "," : ".") +
				(fraction < 10 ? "0" : "") +
				fraction
		);
	}
}
