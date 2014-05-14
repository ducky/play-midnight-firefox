jQuery(function($){

/* Responsible for Loading/Saving Options */
var PlayMidnightOptions = {

	/* Load Options and Populate Checkboxes */
	populate: function( options ) {
		var pm = this;

		var favIcon = $('#play-midnight-options #favicon');
		var themeColor = $('#play-midnight-options #' + options.theme + '.theme-color');

		favIcon.attr( 'checked', options.favicon ).closest('.option').addClass('selected');
		themeColor.attr( 'checked', true ).closest('.option').addClass('selected');

		$('#play-midnight-options #save').addClass( options.theme );
		$('#play-midnight-options .option').on('click', function() {
			pm.doSelect(this);
		});
	},

	/* Add 'Selected' Class to Main Option Div */
	doSelect: function( ele ) {
		var option = $(ele);
		var group = option.closest('.options-group');

		group.find('.selected').removeClass('selected');
		option.addClass('selected');
	},

	/* Save Options to Simple Storage */
	save: function( callback ) {
		/* Options Values */
		var favicon = $('#play-midnight-options #favicon').is(':checked');
		var theme = $('#play-midnight-options .theme-color:checked').attr('id');

		/* Status Update Text */
		var status = $('#play-midnight-options #status');

		/* Tell Main.js to Save Options */
		self.port.emit( 'save-options', {
			favicon: favicon,
			theme: theme
		});

		/* Send Feedback to User on Save */
		self.port.on( 'options-saved', function (result) {
			if ( result ) {
				
				status.fadeIn(500, function() {
					setTimeout(function() {
						status.fadeOut(500, function() {
							if ( typeof callback === 'function' ) {
								callback();
							}
						});
					}, 800);
				});

			}
		});
	}
};

/* Responsible for Setting Up Play Midnight */
var PlayMidnight = {

	/* Store Current Play Midnight Options */
	options: {

	},

	/* Initialize */
	init: function() {
		var pm = this;

		/* Get Updated Options from Main.js */
		self.port.emit( 'get-options' );

		/* Load Updated Options */
		self.port.on( 'options-received', function( options ) {
			pm.options = options;
			pm.options.pluginUrl = self.options.pluginUrl;

			/* Inject Stylesheet, Favicon, and Options */
			pm.injectStyle();
			pm.updateFavicon();
			pm.injectOptions( function() {

				/* Populate Option Checkboxes */
				PlayMidnightOptions.populate( pm.options );

				/* Bind Option Button Clicks */
				$('#play-midnight-options #save').on( 'click', function(e) {
					e.preventDefault();

					/* Refresh on Save */
					PlayMidnightOptions.save( function() {
						location.reload(true);
					} );
				});

				$('#play-midnight-options #cancel').on( 'click', function(e) {
					e.preventDefault();

					$('#play-midnight-options').removeClass('show');
				});
			});

			/* Add Play Midnight Credits */
			pm.addCredits();
		});
	},

	/* Inject Stylesheet */
	injectStyle: function() {

		/* Get Saved Theme Color */
		var theme = this.options.theme;

		/* Create Stylesheet */
		var style = $('<link>', {
			rel: 'stylesheet',
			type: 'text/css',
			href: this.options.pluginUrl + 'css/play-midnight-' + theme + '.css'
		});
		$('head').append(style);
	},

	/* Inject Options Page */
	injectOptions: function( callback ) {
		/* Create Options Wrapper */
		var options = $('<div />', { id: 'play-midnight-options' });
		var pm = this;

		/* Add Options Content from File, Append to Body */
		options.html( self.options.optionsPage );
		$('body').append( options );

		/* Create Options Button */
		var button = $('<button />', { id: 'btn-pm-options', class: 'button small vertical-align' })
			.append( $('<img />', { src: pm.options.pluginUrl + 'images/icon64.png' }))
			.append( '<span>Play Midnight Options</span>' );

		/* Setup Button Click Event */
		button.on( 'click', function() {
			$('#play-midnight-options').addClass('show');
		});

		/* Add Button to Nav Bar */
		$('#headerBar .nav-bar').prepend( button );
		
		/* Callback Function */
		if ( typeof callback === 'function' ) {
			callback();
		}
	},

	/* Inject Favicon */
	updateFavicon: function() {
		/* Check if favicon enabled */
		if ( this.options.favicon === true ) {
			/* Try to Override Cache with Timestamp */
			var iconUrl = this.options.pluginUrl + 'images/favicon.ico' + '?v=' + Date.now();

			/* Remove old Favicon link and Append New */
			$('link[rel="SHORTCUT ICON"]').remove();
			$('head').append( $('<link>', {
				rel: 'shortcut icon',
				href: iconUrl
			}) );
		}
	},

	/* Add Author Credits to Bottom of Sidebar */
	addCredits: function() {
		var donateUrl = 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KHH9ZJH42FF4J';
		var personalUrl = 'http://christieman.com/';

		var divider = $('<div', {
			class: 'nav-section-divider'
		});

		var header = $('<div>', {
			class: 'nav-section-header',
			text: 'PLAY MIDNIGHT - '
		}).append( $('<a>', { href: donateUrl, text: 'DONATE' }) );

		var credits = $('<ul>', { id: 'play-midnight' })
			.append( $('<li>', { class: 'nav-item-container' })
				.append( $('<a>', {
					href: personalUrl,
					text: 'By Chris Tieman'
				})));

		if ( !$('#playMidnight-credits').length ) {
			$('#nav').append(
				$('<div>', { id: 'playMidnight-credits', })
					.append(divider)
					.append(header)
					.append(credits));
		}
	}
};

/* Initialize Play Midnight */
PlayMidnight.init();


});