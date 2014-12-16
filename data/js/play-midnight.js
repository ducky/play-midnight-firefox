jQuery(function($){

/* Responsible for Loading/Saving Options */
var PlayMidnightOptions = {

	/* Load Options and Populate Checkboxes */
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
		var styled = $('#play-midnight-options #styled').is(':checked');
		var recentActivity = $('#play-midnight-options #recentActivity').is(':checked');
		var theme = $('#play-midnight-options .theme-color:checked').attr('id');

		/* Status Update Text */
		var status = $('#play-midnight-options #status');

		/* Tell Main.js to Save Options */
		self.port.emit( 'save-options', {
			favicon: favicon,
			styled: styled,
			recentActivity: recentActivity,
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

			/*if ( pm.options.recentActivity === true ) {
				pm.addSortOptions();
			}*/

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
	},

	/* Add Recent Activity Sidebar / Filters */
	addSortOptions: function() {
		var sortHtml = [
			'<div id="recent-sort" class="tab-container">',
			' <a class="header-tab-title selected" data-reason="0">All</a>',
			' <a class="header-tab-title" data-reason="2">Added</a>',
			' <a class="header-tab-title" data-reason="3">Played</a>',
			' <a class="header-tab-title" data-reason="5">Created</a>',
			'</div>',
		].join('');

		// Add a link directly to Recent, after the first "Listen Now" link
		$('<a data-type="recent" class="nav-item-container tooltip" href="">Recent Activity</a>')
			.insertAfter('#nav_collections a:nth-child(2)');

		// Add sort links to the header
		function toggleRecentUI() {
			// Only add them if "Recent" string is present and we're not already in this view.
			// Otherwise remove the UI completely.
			if ( $(this).children('.tab-text:contains(Recent)').length && ! $(this).children('#recent-sort').length ) {
				$(this).append(sortHtml);
			} else {
				$('#recent-sort').remove();
			}
			$(this).one('DOMSubtreeModified', toggleRecentUI);
		}

		// Make sure this only fires once or else we would be in an infinite loop,
		// since the function itself modifies the DOM subtree.
		$('#breadcrumbs').one('DOMSubtreeModified', toggleRecentUI);

		// Filter toggling behavior
		$('#breadcrumbs').on('click', 'a', function() {
			var $this = $(this);
			var reason = parseInt($this.data('reason'));
			var selector = (reason === 0 ? '*' : '[data-reason=' + reason + ']');
			var $cards = $('#music-content .card');

			$this.addClass('selected').siblings().removeClass('selected');
			$cards.filter(selector).show();
			$cards.not(selector).hide();
		});
	}
};

/* Initialize Play Midnight */
PlayMidnight.init();


});