const widgetClasses = {};

export default class WidgetLoader {

	static initialize() {
		var $widgets = $('.js_widget:not(.js_widget-constructed)');
		$widgets.each((index, widget) => {
			WidgetLoader._loadWidget($(widget));
		});
	}

	static add(className, widgetClass) {
		widgetClasses[className] = widgetClass;
	}

	static _loadWidget($widget) {
		var className = $widget.attr("data-class");
		if (!className) {
			console.error("The following widget is missing a data-class attribute:");
			console.error($widget[0]);
			return;
		}

		var widgetClass = widgetClasses[className];
		if (!widgetClass) {
			console.error("Unknown widget class '" + className + "'");
			return;
		}

		$widget.addClass('js_widget-constructed');
		new widgetClass($widget);
	}

}
