import Ajax from '../Ajax.js';
import Form from '../form/Form.js';
import LangUtils from '../LangUtils.js';
import MessageUtils from '../MessageUtils.js';
import UrlParser from '../UrlParser.js';
import Widget from '../Widget.js';

import contactEmail from '../handlebars/contactEmail.js';

import MAIN_DE_TEMPLATE from './CartWidget-de.hbs';
import MAIN_EN_TEMPLATE from './CartWidget-en.hbs';
import PAYPAL_DE_TEMPLATE from './CartWidget-paypal-de.hbs';
import PAYPAL_EN_TEMPLATE from './CartWidget-paypal-en.hbs';
import PRICE_TEMPLATE from './CartWidget-price.hbs';

export default class CartWidget extends Widget {

	constructor($widget) {
		super($widget);
		this.$table = $widget.find('.js_table');
		var terms = $widget.attr('data-terms');

		var productCode = $widget.attr('data-product');
		if (!productCode) {
			productCode = UrlParser.getParams()['product'];
		}
		if (!productCode) {
			window.location.href = window.location.href.replace('cart', 'purchase');
			return;
		}

		this.spinner();
		Ajax.rpc('/product', {code: productCode}, program => {
			this.program = program;

			var params = {program: program, terms: terms};
			$widget.html(LangUtils.isGerman() ? MAIN_DE_TEMPLATE(params) : MAIN_EN_TEMPLATE(params));
			this.update();

			$widget.find('[name="quantity"]').change(() => {
				this.update();
			});

			Form.onSubmit($widget, action => {
				this.checkout(action);
			});
		}, error => {
			if (LangUtils.isGerman()) {
				MessageUtils.error($widget, 'Ups! Ich habe Probleme damit, das Produkt dem Warenkorb hinzuzufügen.\n'
					+ 'Bitte versuchen Sie es später noch einmal.\n'
					+ 'Sollte das Problem bestehen bleiben, schreiben Sie bitte an ' + contactEmail());
			} else {
				MessageUtils.error($widget, 'Oops! I am having problems to add the product to your cart.\n'
					+ 'Please try again later.\n'
					+ 'If this problem persists, please contact ' + contactEmail());
			}
		});
	}

	static calculate(price, quantity) {
		var totalPrice = parseInt(price + (quantity - 1) * price * 0.8, 10);
		var totalPriceWithoutDiscount = quantity * price;
		var discount = totalPrice - totalPriceWithoutDiscount;

		return {totalPrice, totalPriceWithoutDiscount, discount};
	}

	checkout(action) {
		var quantity = this.getQuantity();
		if (quantity === undefined)
			return;

		action.wait(LangUtils.isGerman() ? 'Bitte warten...' : 'Please wait...');
		Ajax.rpc('/createPayPalOrder', {
			quantity: quantity,
			product: this.program.code,
			lang: LangUtils.getLang()
		}, result => {
			this.setPageHeadline(LangUtils.isGerman() ? 'Zahlungsart auswählen' : 'Choose payment method');
			this.$widget.html(LangUtils.isGerman() ? PAYPAL_DE_TEMPLATE() : PAYPAL_EN_TEMPLATE());

			PAYPAL.apps.PPP({
				approvalUrl: result.approvalUrl,
				placeholder: 'paypal-plus',
				mode: result.test ? 'sandbox' : 'live',
				useraction: 'continue',
				country: 'DE',
				showLoadingIndicator: true
			});
		}, error => {
			if (LangUtils.isGerman()) {
				action.error('Ups! Ich habe Probleme damit, die Bestellung zu speichern.\n'
					+ 'Bitte versuchen Sie es später noch einmal.\n'
					+ 'Sollte das Problem bestehen bleiben, schreiben Sie bitte an ' + contactEmail());
			} else {
				action.error('Oops! I am having problems to place the order.\n'
					+ 'Please try again later.\n'
					+ 'If this problem persists, please contact ' + contactEmail());
			}
		});
	}

	getQuantity() {
		var $quantity = this.$widget.find('[name="quantity"]');
		var quantity = parseInt($quantity.val(), 10);
		if (isNaN(quantity) || quantity < 1 || quantity > 100) {
			quantity = undefined;
		}

		return quantity;
	}

	update() {
		var quantity = this.getQuantity();
		var $quantity = this.$widget.find('[name="quantity"]');
		if (quantity === undefined) {
			$quantity.addClass('has-error');
			this.$widget.find('.js_unit-price').text('-');
			this.$widget.find('.js_total-price').text('-');
			this.$widget.find('.js_discount-row').addClass('hidden');
			this.$widget.find('.js_grand-total').text('-');
		} else if (quantity === 1){
			$quantity.removeClass('has-error');
			var totalPrice = this.program.price;
			this.$widget.find('.js_unit-price').text(PRICE_TEMPLATE(this.program.price));
			this.$widget.find('.js_total-price').text(PRICE_TEMPLATE(totalPrice));
			this.$widget.find('.js_discount-row').addClass('hidden');
			this.$widget.find('.js_grand-total').text(PRICE_TEMPLATE(totalPrice));
		} else {
			$quantity.removeClass('has-error');
			var calculation = CartWidget.calculate(this.program.price, quantity);
			this.$widget.find('.js_unit-price').text(PRICE_TEMPLATE(this.program.price));
			this.$widget.find('.js_total-price').text(PRICE_TEMPLATE(calculation.totalPriceWithoutDiscount));
			this.$widget.find('.js_discount-row').removeClass('hidden');
			this.$widget.find('.js_discount-price').text(PRICE_TEMPLATE(calculation.discount));
			this.$widget.find('.js_grand-total').text(PRICE_TEMPLATE(calculation.totalPrice));
		}
	}
}
