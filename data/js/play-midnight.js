(function($){

// Play Midnight Options
// Load and Populate options from Firefox storage
var PlayMidnightOptions = {
	// Populate Options Page (Checkboxes)
	populate: function( options ) {
		var pm = this;

		var favIcon = $('#play-midnight-options #favicon');
		var styled = $('#play-midnight-options #styled');
		var recentActivity = $('#play-midnight-options #recentActivity');
		var themeColor = $('#play-midnight-options #' + options.theme + '.theme-color');

		if ( options.favicon ) {
			favIcon.prop( 'checked', true ).closest('.option').addClass('selected');
		}

		if ( options.styled ) {
			styled.prop( 'checked', true ).closest('.option').addClass('selected');
		}

		if ( options.recentActivity ) {
			recentActivity.prop( 'checked', true ).closest('.option').addClass('selected');
		}

		themeColor.prop( 'checked', true ).closest('.option').addClass('selected');

		$('#play-midnight-options #save').addClass( options.theme );
		$('#play-midnight-options .option').on('click', function() {
			pm.doSelect(this);
		});
	},

	// Update Classes on Checkbox Select
	doSelect: function( ele ) {
		var option = $(ele);
		var group = option.closest('.options-group');

		group.find('.selected').removeClass('selected');
		option.addClass('selected');
	},

	// Save Settings to Simple Storage
	save: function( callback ) {
		// Get All Settings Values
		var favicon = $('#play-midnight-options #favicon').is(':checked');
		var styled = $('#play-midnight-options #styled').is(':checked');
		var recentActivity = $('#play-midnight-options #recentActivity').is(':checked');
		var theme = $('#play-midnight-options .theme-color:checked').attr('id');

		// Status Update Text
		var status = $('#play-midnight-options #status');

		// Tell Main.js to Save Options
		self.port.emit( 'save-options', {
			favicon: favicon,
			styled: styled,
			recentActivity: recentActivity,
			theme: theme
		});

		// Send Feedback to User on Save
		self.port.on('options-saved', function (result) {
			if (result) {
				// Show Status, then call Callback function
				status.fadeIn(500, function() {
					setTimeout(function() {
						status.fadeOut(500, function() {
							if (callback && typeof callback === 'function') {
								callback();
							}
						});
					}, 800);
				});
			}
		});
	}
};

// Play Midnight Object
// Load Options, Inject Stylesheet, Favicon, Options, Credits
var PlayMidnight = {

	options: {},

	init: function() {
		var pm = this;

		// Request Updated Options from Main.js
		self.port.emit('get-options');

		// Load Updated Options on Receive
		self.port.on( 'options-received', function( options ) {
			pm.options = options;
			pm.options.pluginUrl = self.options.pluginUrl;

			// Inject Stylesheet
			pm.injectStyle();

			// Apply New Favicon
			pm.updateFavicon();

			// Inject Options Template
			pm.injectOptions(function() {
				// Populate Options Template Values
				PlayMidnightOptions.populate( pm.options );

				// Save Options, Refresh Page
				$('#play-midnight-options #save').on( 'click', function(e) {
					e.preventDefault();

					PlayMidnightOptions.save( function() {
						location.reload(true);
					} );
				});

				// Hide Options
				$('#play-midnight-options #cancel').on( 'click', function(e) {
					e.preventDefault();

					$('#play-midnight-options').removeClass('show');
				});
			});

			// Add Recent Activity/Sorting
			pm.addSortOptions();

			// Add Personal Credits
			pm.addCredits();
		});
	},

	/* Inject Stylesheet */
	injectStyle: function() {
		/* Get Saved Theme Color */
		var theme = this.options.theme;

		/* Create Stylesheet */
		var style = null;
		if ( this.options.styled === true ) {
			style = $('<link>', {
				rel: 'stylesheet',
				type: 'text/css',
				href: this.options.pluginUrl + 'css/play-midnight-' + theme + '.css'
			});
		} else {
			style = $('<link>', {
				rel: 'stylesheet',
				type: 'text/css',
				href: this.options.pluginUrl + 'css/play-midnight-options.css'
			});
		}

		/* Inject Stylesheet */
		$('head').append(style);
	},

	/* Inject Options Page */
	injectOptions: function( callback ) {
		// Create Options Div
		var options = $('<div />', {
			id: 'play-midnight-options',
		});
		var pm = this;

		// Set Options Div HTML
		options.html(self.options.optionsPage);

		// Append to Body
		$('body').append( options );

		// Create Play Midnight Button w/ Logo
		var button = $('<button />', { id: 'btn-pm-options', class: 'button small vertical-align' })
			.append( $('<img />', { src: pm.options.pluginUrl + 'images/icon64.png' }))
			.append( '<span>Play Midnight Options</span>' );

		// Show Options on Click
		button.on( 'click', function() {
			$('#play-midnight-options').addClass('show');
		});

		// Append Button to Navbar
		$('#headerBar .nav-bar').prepend( button );

		// Callback Function
		if (callback && typeof callback === 'function') {
			callback();
		}
	},

	// Update Favicon to Play Midnight version
	updateFavicon: function() {
		if ( this.options.favicon !== true ) {
			return;
		}

		// Load Newest Icon with Timestamp to prevent Caching
		var iconUrl = this.options.pluginUrl + 'images/favicon.ico' + '?v=' + Date.now();

		// Remove Old Favicon
		$('link[rel="SHORTCUT ICON"], link[href="favicon.ico"]').remove();

		// Add New Favicon
		$('head').append( $('<link>', {
			type: 'image/x-icon',
			rel: 'icon',
			href: iconUrl
		}) );
	},

	// Add Personal Credits
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
	},

	// Add Recent Activity and Sorting options
	addSortOptions: function() {
		if ( this.options.recentActivity !== true ) {
			return;
		}

		// Add a link directly to Recent, after the first "Listen Now" link
		$('<a data-type="recent" class="nav-item-container tooltip" href="">Recent Activity</a>').insertAfter('#nav_collections a:nth-child(2)');
	}
};


// Load Play Midnight
PlayMidnight.init();

})(jQuery);