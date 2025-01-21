import '../../../common/js/3rdparty/date.js';
import '../../../common/js/3rdparty/prism.js';

import $ from 'webpack-zepto';
window.$ = $;

// TODO: Remove when creating a new site
import CopyUtils from '../../../common/js/CopyUtils.js';

import Accordion from '../../../common/js/Accordion.js';
import Ajax from '../../../common/js/Ajax.js';
import Money from '../../../common/js/Money.js';
import Navigation from '../../../common/js/Navigation.js';
import NoIndex from '../../../common/js/NoIndex.js';
import SelectableTableRow from '../../../common/js/SelectableTableRow.js';
import WidgetLoader from '../../../common/js/WidgetLoader.js';
import ZoomImage from '../../../common/js/image/ZoomImage.js';

import DatePickerWidget from '../../../common/js/datepicker/DatePickerWidget.js';
import DropDownWidget from '../../../common/js/dropdown/DropDownWidget.js';

import ExampleButtonStateWidget from './example/ExampleButtonStateWidget.js';
import ExampleDialogWidget from './example/ExampleDialogWidget.js';
import ExampleWidget from './example/ExampleWidget.js';

$(() => {
	Ajax.initialize();

	// TODO: Remove when creating a new site
	CopyUtils.initialize();

	Accordion.initialize();
	Money.initialize();
	Navigation.initialize();
	NoIndex.initialize();
	SelectableTableRow.initialize();
	ZoomImage.initialize();

	WidgetLoader.add('DatePickerWidget', DatePickerWidget);
	WidgetLoader.add('DropDownWidget', DropDownWidget);

	WidgetLoader.add('ExampleButtonStateWidget', ExampleButtonStateWidget);
	WidgetLoader.add('ExampleDialogWidget', ExampleDialogWidget);
	WidgetLoader.add('ExampleWidget', ExampleWidget);

	WidgetLoader.initialize();
});
