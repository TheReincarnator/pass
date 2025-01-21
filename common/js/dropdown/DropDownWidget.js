import Widget from "../Widget.js";

import DROP_DOWN_ARROW_TEMPLATE from "./DropDownWidget-drop-down-arrow.hbs";
import SELECT_TEMPLATE from "./DropDownWidget-select.hbs";

export default class DropDownWidget extends Widget {
	constructor($widget) {
		super($widget);
		this.wasFocussed = false;

		this.$dropDown = $widget.find(".js_drop-down");
		$widget.append(DROP_DOWN_ARROW_TEMPLATE());

		var $input = $widget.find(".input--combo-box");
		if ($input.length) {
			// Use input instead of keypress to work around Chrome mobile issues
			$input[0].addEventListener("input", event => {
				if (event.data && event.data.length) {
					window.setTimeout(() => {
						this.autoComplete();
					}, 1);
				}
			});

			$input.keydown(event => {
				if (event.which == 38) {
					this.moveCombo(-1);
					event.preventDefault();
				} else if (event.which == 40) {
					this.moveCombo(1);
					event.preventDefault();
				}
			});
		} else {
			$widget.on("change", () => {
				this.updateSelect();
			});
			DropDownWidget.setValue($widget, $widget.attr("data-value"));

			$(window).on("focus", "input,select,textarea", event => {
				this.onAnyFocus($(event.target));
			});
		}

		$(window).click(event => {
			this.onAnyClick($(event.target));
		});

		$widget.on("click", ".js_drop-down-option", event => {
			var $option = $(event.currentTarget);
			DropDownWidget.setValue($widget, $option.attr("data-value"));
			this.setOpen(false);
		});
	}

	static getValue($widget) {
		var $input = $widget.find(".input--combo-box");
		if ($input.length) {
			return $input.val();
		} else {
			return $widget.attr("data-value");
		}
	}

	static setValue($widget, value, suppressTrigger) {
		var $input = $widget.find(".input--combo-box");
		if ($input.length) {
			$input.val(value);
		} else {
			$widget.attr("data-value", value);

			var $value = $('<div class="drop-down__value js_drop-down-value"></div>');
			var $option = $widget.find(
				'.js_drop-down-option[data-value="' + value + '"]'
			);
			if ($option.length) {
				$value.html($option.html());
			}

			$widget.find(".js_drop-down-value").remove();
			$widget.append($value);
		}

		if (!suppressTrigger) {
			// You can also listen to this event in your app's code
			$widget.trigger("change");
		}
	}

	autoComplete() {
		var $input = this.$widget.find(".input--combo-box");
		var text = $input.val().toLowerCase();
		if (!text.length) return;

		var match = undefined;
		this.$widget.find(".js_drop-down-option").each((index, option) => {
			var value = $(option).attr("data-value");
			if (value.toLowerCase().indexOf(text) == 0) {
				match = value;
				return false;
			}
		});

		if (match !== undefined && match !== $input.val()) {
			$input.val(match);

			// Workaround for setSelectionRange bug on Android
			// A timeout of 1 is too short,
			// and a timeout longer than 50 may cause typing errors
			window.setTimeout(() => {
				$input[0].setSelectionRange(text.length, match.length);
			}, 20);
		}
	}

	isOpen() {
		return this.$dropDown.is(".is-open");
	}

	onAnyClick($element) {
		if (
			$element.closest(".js_drop-down").length ||
			$element.closest(".input--combo-box").length ||
			$element.closest(".js_drop-down-select").length
		) {
			return;
		}

		if (
			!$element.closest(this.$widget).length ||
			(this.$widget.find(".input--combo-box").length &&
				!$element.closest(".drop-down__arrow").length)
		) {
			this.setOpen(false);
			return;
		}

		this.setOpen(!this.isOpen());
	}

	moveCombo(step) {
		var $input = this.$widget.find(".input--combo-box");
		var text = $input.val().toLowerCase();

		var $options = this.$widget.find(".js_drop-down-option");
		if (!$options.length) return;

		var position = undefined;
		if (!text.trim().length) {
			position = step < 0 ? $options.length - 1 : 0;
		} else {
			$options.each((index, option) => {
				var value = $(option).attr("data-value");
				if (value.toLowerCase().indexOf(text) == 0) {
					position = index;
					return false;
				}
			});

			if (position === undefined) {
				return;
			}

			position = (position + step + $options.length) % $options.length;
		}

		$input.val($options.eq(position).attr("data-value"));
	}

	onAnyFocus($element) {
		var focussed =
			$element.hasClass("js_drop-down-select") &&
			$element.closest(this.$widget).length;
		if (focussed == this.wasFocussed) {
			return;
		}
		this.wasFocussed = focussed;

		this.setOpen($element.closest(this.$widget).length);
	}

	setOpen(open) {
		if (open) {
			this.wasFocussed = true;

			var value = DropDownWidget.getValue(this.$widget);
			this.$dropDown
				.find(".drop-down__options__option")
				.removeClass("is-selected");
			if (value) {
				this.$dropDown
					.find('.drop-down__options__option[data-value="' + value + '"]')
					.addClass("is-selected");
			}

			this.$dropDown.addClass("is-open");
			this.$dropDown.css("width", this.$widget.width() - 2);
		} else {
			this.$dropDown.removeClass("is-open");
		}
	}

	updateSelect() {
		var value = DropDownWidget.getValue(this.$widget);

		var options = [];
		options.push({
			label: "",
			value: "",
			selected: value === "" || value === null || value === undefined
		});

		var $options = this.$widget.find(".js_drop-down-option");
		$options.each((index, option) => {
			var $option = $(option);
			options.push({
				label: $option.text(),
				value: $option.attr("data-value"),
				selected: $option.attr("data-value") == value
			});
		});

		this.$widget.find(".js_drop-down-select").remove();

		var $select = $(
			SELECT_TEMPLATE({
				options: options,
				validate: this.$widget.attr("data-validate")
			})
		);
		this.$widget.prepend($select);
		if (this.wasFocussed) {
			$select.focus();
		}

		$select.change(() => {
			var value = $select.val();
			DropDownWidget.setValue(this.$widget, value, true);
			this.setOpen(true);
		});
		$select.keydown(event => {
			if (event.which == 13) {
				this.setOpen(!this.isOpen());
			} else if (event.which == 27) {
				this.setOpen(false);
			}
		});
	}
}
