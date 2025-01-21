export default class LangUtils {

	static getLang() {
		if (LangUtils.lang) {
			return LangUtils.lang;
		}

		var lang = $('html').attr('lang');
		LangUtils.lang = lang == 'de' || lang == 'DE' ? 'de' : 'en';

		return LangUtils.lang;
	}

	static isGerman() {
		return LangUtils.getLang() === 'de';
	}

	static isEnglish() {
		return LangUtils.getLang() === 'en';
	}

}
