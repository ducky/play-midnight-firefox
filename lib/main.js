var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");

pageMod.PageMod({
	include: /^https?:\/\/play\.google\.com\/music\/listen([?\/].*|$)/,
	contentScriptWhen: 'ready',
	contentScriptFile: [
		data.url('js/jquery.min.js'),
		data.url('js/play-midnight.min.js')
	],
	contentScriptOptions: {
		stylesheetUrl: data.url('css/play-midnight.css'),
		faviconUrl: data.url('images/favicon.ico')
	}
});