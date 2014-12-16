var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var ss = require("sdk/simple-storage").storage;

/* Default Values */
var defaults = {
	favicon: true,
	styled: true,
	recentActivity: true,
	theme: 'default'
};

/* Set Defaults if no Options Exist */
if ( !ss.playmidnight ) {
	ss.playmidnight = defaults;
}

/* Add Content Script to Page */
pageMod.PageMod({
	include: /https?:\/\/play.google.com\/music\/listen([?#\/].*|$)/,
	contentScriptWhen: 'end',
	contentScriptFile: [
		/* Minified PlayMidnight File */
		data.url('js/play-midnight.min.js')
	],
	contentScriptOptions: {
		/* Path to Plugin */
		pluginUrl: data.url(),

		/* Options Page HTML */
		optionsPage: data.load('assets/options.html')
	},
	onAttach: function (worker) {
		/* Save Options via Save Button */
		worker.port.on( 'save-options', function( options ) {
			ss.playmidnight = options;

			/* Tell File Options Saved */
			worker.port.emit( 'options-saved', true );
		});

		/* Get Updated Options via Play Midnight (Load Updated on Page Reload) */
		worker.port.on( 'get-options', function() {

			/* Send Options to Play Midnight */
			worker.port.emit( 'options-received', ss.playmidnight );
		});
	}
});