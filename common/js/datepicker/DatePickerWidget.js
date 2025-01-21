import LangUtils from "../LangUtils.js";
import Widget from "../Widget.js";

import MAIN_TEMPLATE from "./DatePickerWidget.hbs";
import CALENDAR_TEMPLATE from "./DatePickerWidget-calendar.hbs";

const CW_HEADER_DE = "KW";
const CW_HEADER_EN = "CW";
const HEADERS_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const HEADERS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS_DE = [
	"Jan",
	"Feb",
	"Mär",
	"Apr",
	"Mai",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Okt",
	"Nov",
	"Dez"
];
const MONTHS_EN = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];

export default class DatePickerWidget extends Widget {
	constructor($widget) {
		super($widget);
		this.wasFocussed = false;

		$widget.append(MAIN_TEMPLATE({ validate: $widget.attr("data-validate") }));
		this.$date = $widget.find(".js_datepicker-date");
		this.$text = $widget.find(".js_datepicker-text");
		this.$dropDown = $widget.find(".js_drop-down");

		var minDateString = $widget.attr("data-mindate");
		if (minDateString) {
			this.minDate = this.parseDate(this.minDateString);
		} else {
			var yearsBack = $widget.attr("data-yearsback");
			yearsBack = yearsBack ? parseInt(yearsBack, 10) : null;
			if (yearsBack == null || yearsBack < 0 || yearsBack > 200)
				yearsBack = 200;
			this.minDate = new Date();
			this.minDate.add(-yearsBack).years();
		}

		var maxDateString = $widget.attr("data-maxdate");
		if (maxDateString) {
			this.maxDate = this.parseDate(this.maxDateString);
		} else {
			var yearsForth = $widget.attr("data-yearsforth");
			yearsForth = yearsForth ? parseInt(yearsForth, 10) : null;
			if (yearsForth == null || yearsForth < 0 || yearsForth > 200)
				yearsForth = 200;
			this.maxDate = new Date();
			this.maxDate.add(yearsForth).years();
		}

		this.setDate(this.parseDate($widget.attr("data-initial")));

		$(window).on("focus", "input,select,textarea", event => {
			this.onAnyFocus($(event.target));
		});
		$(window).click(event => {
			this.onAnyClick($(event.target));
		});

		this.$text.blur(() => {
			// Apply constraints
			this.setDate(this.getDate());
		});

		this.$date.blur(() => {
			// Apply constraints
			this.setDate(this.getDate());
		});

		this.$text.on("keyup", () => {
			var dateString = this.$text.val().replace(/ +/, "");
			if (dateString == "") {
				this.$date.val("");
				this.updateDatePicker();
			} else if (dateString.match("^[0-9]{1,2}.[0-9]{1,2}.[0-9]{1,4}$")) {
				var parts = dateString.split(".");
				var day = parseInt(parts[0], 10);
				var month = parseInt(parts[1], 10);
				var year = parseInt(parts[2], 10);
				var thisYear = new Date().getYear() + 1900;
				if (year < 100) {
					if (year < (thisYear - 80) % 100) year += 100;
					year += parseInt((thisYear - 80) / 100, 10) * 100;
				}

				var date = this.checkConstraints(
					new Date(year, month - 1, day, 0, 0, 0)
				);
				if (
					date.getDate() == day &&
					date.getMonth() + 1 == month &&
					date.getYear() + 1900 == year
				) {
					this.$date.val(date.toString("yyyy-MM-dd"));
					this.updateDatePicker();
				}
			}
		});
		this.$text.keydown(event => {
			if (event.which == 13 || event.which == 27) {
				this.setOpen(false);
			} else if (event.which != 8) {
				this.setOpen(true);
			}
		});
		this.$text.on("mouseup", () => {
			// Special case for IE11: Clearing the input with the 'X' control
			window.setTimeout(() => {
				var dateString = this.$text.val().replace(/ +/, "");
				if (dateString == "") {
					this.$date.val("");
					this.updateDatePicker();
				}
			}, 1);
		});

		$widget.find(".js_datepicker-prev-month").click(event => {
			var date = this.getDate() || new Date();
			this.setDate(date.add(-1).months());
		});
		$widget.find(".js_datepicker-next-month").click(event => {
			var date = this.getDate() || new Date();
			this.setDate(date.add(1).months());
		});
		$widget.find(".js_datepicker-prev-year").click(event => {
			var date = this.getDate() || new Date();
			this.setDate(date.add(-1).years());
		});
		$widget.find(".js_datepicker-next-year").click(event => {
			var date = this.getDate() || new Date();
			this.setDate(date.add(1).years());
		});

		$widget.on("setDate", (event, data) => {
			this.setDate(data);
		});
	}

	static dateStringToDate(dateString) {
		if (!dateString) {
			return null;
		}

		var parts = dateString.split(/-/);
		if (parts.length != 3) {
			return null;
		}

		var year = parseInt(parts[0], 10);
		var month = parseInt(parts[1], 10);
		var day = parseInt(parts[2], 10);
		return new Date(year, month - 1, day, 0, 0, 0);
	}

	static getDate($widget) {
		var dateString = $widget ? $widget.find(".js_datepicker-date").val() : null;
		return DatePickerWidget.dateStringToDate(dateString);
	}

	static registerChangeListener($widget, callback) {
		$widget.find(".js_datepicker-date").change(callback);
	}

	static setDate($widget, date) {
		$widget.trigger("setDate", date);
	}

	static unregisterChangeListener($widget, callback) {
		$widget.find(".js_datepicker-date").off();
	}

	checkConstraints(date) {
		if (date) {
			if (this.minDate != null && date < this.minDate) {
				date = this.minDate;
			} else if (this.maxDate != null && date > this.maxDate) {
				date = this.maxDate;
			}
		}

		return date;
	}

	createCellData(cellDate, selectedDay, selectedMonth, includeWeekNumber) {
		var result = {
			day: cellDate.getDate(),
			month: cellDate.getMonth() + 1,
			year: cellDate.getYear() + 1900,
			valid:
				(!this.minDate || cellDate >= this.minDate) &&
				(!this.maxDate || cellDate <= this.maxDate),
			currentMonth: cellDate.getMonth() + 1 == selectedMonth
		};

		if (includeWeekNumber) {
			result.week = cellDate.getWeekOfYear();
		}

		return result;
	}

	getDate() {
		return DatePickerWidget.getDate(this.$widget);
	}

	getDay() {
		var date = this.getDate();
		return date != null ? date.getDate() : null;
	}

	getMonth() {
		var date = this.getDate();
		return date != null ? date.getMonth() + 1 : null;
	}

	getYear() {
		var date = this.getDate();
		return date != null ? date.getYear() + 1900 : null;
	}

	isOpen() {
		return this.$dropDown.is(".is-open");
	}

	onAnyClick($element) {
		if ($element.closest(".js_drop-down").length) {
			return;
		}

		this.setOpen($element.closest(this.$widget).length);
	}

	onAnyFocus($element) {
		var focussed =
			$element.hasClass("js_datepicker-text") &&
			$element.closest(this.$widget).length;
		if (focussed == this.wasFocussed) {
			return;
		}
		this.wasFocussed = focussed;

		this.setOpen($element.closest(this.$widget).length);
	}

	parseDate(dateString) {
		var date = null;
		if (dateString) {
			$.each(dateString.split(" "), (index, part) => {
				part = part.trim();
				if (part.toLowerCase() == "today") {
					date = new Date();
					return true;
				}

				var parsedDate = DatePickerWidget.dateStringToDate(part);
				if (parsedDate) {
					date = parsedDate;
					return true;
				}

				var amount = parseInt(part.substring(0, part.length - 1), 10);
				var unit = part.substring(part.length - 1, part.length);

				if (unit == "y") {
					if (date === null) date = new Date();
					date.add(parseInt(amount, 10)).years();
				} else if (unit == "m") {
					if (date === null) date = new Date();
					date.add(parseInt(amount, 10)).months();
				} else if (unit == "d") {
					if (date === null) date = new Date();
					date.add(parseInt(amount, 10)).days();
				}
			});
		}
		return date;
	}

	setDate(date) {
		date = this.checkConstraints(date);

		var oldValue = this.$date.val();
		var newValue = date != null ? date.toString("yyyy-MM-dd") : "";
		this.$date.val(newValue);

		this.$text.val(date != null ? date.toString("d.M.yyyy") : "");
		if (this.isOpen()) {
			this.updateDatePicker();
		}

		if (oldValue !== newValue) {
			this.$date.trigger("change");
		}
	}

	setOpen(open) {
		if (open) {
			this.wasFocussed = true;

			this.$dropDown.addClass("is-open");
			this.$dropDown.css("width", this.$widget.width() - 2);
			this.updateDatePicker();
		} else {
			this.$dropDown.removeClass("is-open");
		}
	}

	updateDatePicker() {
		var selectedDay = this.getDay();
		var selectedMonth = this.getMonth();
		var selectedYear = this.getYear();
		if (selectedMonth == null || selectedYear == null) {
			var today = new Date();
			selectedMonth = today.getMonth() + 1;
			selectedYear = today.getYear() + 1900;
		}

		var previousMonth = parseInt(this.$dropDown.attr("data-month"), 10);
		var previousYear = parseInt(this.$dropDown.attr("data-year"), 10);

		var monthNames = LangUtils.isGerman() ? MONTHS_DE : MONTHS_EN;
		this.$dropDown
			.find(".js_datepicker-month")
			.text(monthNames[selectedMonth - 1]);
		this.$dropDown.find(".js_datepicker-year").text(selectedYear);
		this.$dropDown.attr("data-month", selectedMonth);
		this.$dropDown.attr("data-year", selectedYear);

		if (selectedYear == previousYear && selectedMonth == previousMonth) {
			// Prevent redraw of calendar, otherwise first click does not work
			this.$dropDown.find(".js_datepicker-cell").removeClass("is-selected");
			this.$dropDown
				.find(
					'.js_datepicker-cell[data-day="' +
					selectedDay +
					'"]' +
					'[data-month="' +
					selectedMonth +
					'"]'
				)
				.addClass("is-selected");
			return;
		}

		var firstDay = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0);
		var lastDay = firstDay
			.clone()
			.add(1)
			.months()
			.add(-1)
			.days();

		var firstDayAligned = firstDay.clone();
		while (!firstDayAligned.is().monday()) {
			firstDayAligned.add(-1).days();
		}
		var lastDayAligned = lastDay.clone();
		while (!lastDayAligned.is().sunday()) {
			lastDayAligned.add(1).days();
		}

		var weeks = [];
		for (
			var weekStart = firstDayAligned.clone();
			weekStart.compareTo(lastDayAligned) <= 0;
			weekStart.add(1).weeks()
		) {
			var week = [];
			var dayData = this.createCellData(
				weekStart,
				selectedDay,
				selectedMonth,
				true
			);
			week.push(dayData);

			for (var offset = 0; offset < 7; offset++) {
				var day = weekStart
					.clone()
					.add(offset)
					.days();
				var dayData = this.createCellData(
					day,
					selectedDay,
					selectedMonth,
					false
				);
				dayData.selected =
					day.getDate() == selectedDay && day.getMonth() + 1 == selectedMonth;
				week.push(dayData);
			}

			weeks.push(week);
		}

		this.$widget.find(".js_datepicker-calendar").html(
			CALENDAR_TEMPLATE({
				weeks: weeks,
				cwHeader: LangUtils.isGerman() ? CW_HEADER_DE : CW_HEADER_EN,
				headers: LangUtils.isGerman() ? HEADERS_DE : HEADERS_EN
			})
		);

		this.$dropDown.find(".js_datepicker-cell").click(event => {
			var $cell = $(event.currentTarget);
			var day = parseInt($cell.attr("data-day"), 10);
			var month = parseInt($cell.attr("data-month"), 10);
			var year = parseInt($cell.attr("data-year"), 10);
			this.setDate(new Date(year, month - 1, day, 0, 0, 0));
			this.setOpen(false);

			event.stopPropagation();
			return false;
		});
	}
}
