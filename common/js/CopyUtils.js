export default class CopyUtils {

	static initialize() {
		$('.page-content > *').click(event => {
			if (event.clientX < $(event.target).offset().left) {
				document.execCommand('copy');
				return false;
			}
		});

		$(document).on('copy', event => {
			event.clipboardData.setData('text/plain', event.target.outerHTML);
			event.preventDefault();
		});
	}
}
