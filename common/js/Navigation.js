export default class Navigation {

	static initialize() {
		$('.js_mobile-navigation').click(() => {
			var $body = $('body');
			$body.toggleClass('is-mobile-navigation');

			var $primarySidebar = $('.primary-sidebar');
			if ($body.hasClass('is-mobile-navigation')) {
				var $headerLangs = $('.languages');
				if ($headerLangs.length) {
					$primarySidebar.prepend($headerLangs.clone());
				}
			} else {
				$primarySidebar.find('.languages').remove();
			}
		});

		var $secondary = $('.secondary');
		var $header = $('.site-header');
		var $footer = $('.site-footer');

		var fixed = false;
		$(window).scroll(() => {
			var viewHeight = $(window).height();
			var scrollTop = $(window).scrollTop();
			var headerHeight = $header.height();
			var sidebarViewHeight = viewHeight - $footer.height();
			var sidebarHeight = $secondary.height();

			var shouldBeFixed;
			if (scrollTop < headerHeight) {
				shouldBeFixed = false;
			} else {
				shouldBeFixed = scrollTop >= sidebarHeight + headerHeight - sidebarViewHeight;
			}

			if (fixed == shouldBeFixed) {
				return;
			}
			fixed = shouldBeFixed;

			$secondary.removeClass('secondary--fixed-top');
			$secondary.removeClass('secondary--fixed-bottom');

			if (!fixed) {
				return;
			}

			if (sidebarHeight <= sidebarViewHeight) {
				$secondary.addClass('secondary--fixed-top');
			} else {
				$secondary.addClass('secondary--fixed-bottom');
			}
		});
	}

}
