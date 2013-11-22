var BaseListView = Backbone.View.extend(
/** @lends ListView.prototype */
{
	/**
	 * View collection
	 *
	 * @type __BackboneCollection
	 */
	collection: null,

	/**
	 * Count of elements for render
	 *
	 * @type Number
	 */
	renderElementCount: null,

	mode: null,

	/**
	 * Template for item element selector
	 *
	 * Required %itemNumber% variable
	 *
	 * @type String
	 */
	itemElementSelectorTemplate: null,

	/**
	 * Template for clear list
	 *
	 * @type String
	 */
	clearListTemplate: null,

	/**
	 * Item elements
	 */
	itemElements: null,

	/**
	 * Model binders
	 *
	 * Array of Backbone.ModelBinder instances
	 *
	 * @type Array
	 */
	itemModelBinders: [],

	/**
	 * Item bindings for Backbone.ModelBinder
	 */
	itemBindings: {},

	/**
	 * URLs model
	 *
	 * @type AppUrlSetModel
	 */
	appUrlSetModel: null,

	/**
	 * Set rate
	 * @type boolean
	 */
	setRate: false,

	/**
	 * @class ListView view for news tab
	 *
	 * @augments Backbone.Collection
	 * @param Object options
	 * @constructs
	 */
	initialize: function (options) {
		options = _.extend({
			renderElementCount: this.renderElementCount
		}, options);

		this.appUrlSetModel = options.appUrlSetModel;
		this.renderElementCount = options.renderElementCount;

		this.itemElements = [];

		this.collection.bind('reset', this.renderWithTimeout, this);
	},

	getItemModelBinder: function( index ) {
		if( ! this.itemModelBinders[index] ) {
			this.itemModelBinders[index] = new Backbone.ModelBinder();
		}
		return this.itemModelBinders[index];
	},

	/**
	 * Render with timeout
	 *
	 * @returns Void
	 */
	renderWithTimeout: function() {
		var self = this;
		var args = arguments;
		setTimeout(function(){
			self.render.apply(self, args);
		}, 0);
	},

	/**
	 * Render list
	 *
	 * @returns Void
	 */
	render: function(){
		var self = this;
		if( this.clearListTemplate != null ) {
			$( this.clearListTemplate, this.el ).remove();
		}
		// Slice collection
		var renderModels;
		if (this.renderElementCount) {
			renderModels = this.collection.first(this.renderElementCount);
		} else {
			renderModels = this.collection.models;
		}
		// Render items
		_.each(renderModels, function( model, i ) {
			var itemElement = self.getItemElement(i);
			var modelBinder = self.getItemModelBinder(i);

			if( itemElement ) {
				// remove urlOpenSite if brouser is not IE6
				if( Msw.IE.isIE6() === false && Msw.IE.isWindowsVista60() === false && Msw.IE.isIE7() === false ) {
					if( self.itemBindings['urlOpenSite'] != "undefined" ) {
						delete self.itemBindings['urlOpenSite'];
					}
				}
				modelBinder.bind( model, itemElement, self.itemBindings );
			} else {
				var prevNewsItem = self.getItemElement(i-1);
				var itemElement = prevNewsItem.clone();
				modelBinder.bind( model, itemElement, self.itemBindings );
				prevNewsItem.after( itemElement );
			}

			// add class for news types: REVIEWS and CONTESTS
			var typeNews = model.get( 'type' );
			if( typeNews !== undefined && Msw.IE.isIE6() === false && $( '.news-label', itemElement ).attr('class') != undefined ) {
				// clear classes
				$( '.news-label', itemElement ).removeClass( 'ico-news' ).removeClass( 'ico-review' ).removeClass( 'ico-contest' );
				// set class
				var widgetLanguageAb = Msw.Backbone.languageAb;
				if( widgetLanguageAb != 'rus' ) {
					if( widgetLanguageAb == 'ukr' ) {
						widgetLanguageAb = 'rus';
					} else {
						widgetLanguageAb = 'eng';
					}
				}
				var labelClassName = 'ico-' + typeNews.toLowerCase();
				$( '.news-label', itemElement ).addClass( labelClassName );
				$( '.news-label', itemElement ).addClass( widgetLanguageAb );
			}

			// set video label for news
			var videoNews = model.get( 'video' );
			if( videoNews !== undefined ) {
				if( $( '.ico-video', itemElement ).hasClass( 'hide' ) === false  ) {
					$( '.ico-video', itemElement ).addClass( 'hide' );
				}
				if( videoNews == 1 ) {
					$( '.ico-video', itemElement ).removeClass( 'hide' );
				}
			}

			// set stars for rate
			if( self.setRate == true ) {
				model.get('gameUserRatingModel').parentModel = self.collection;
				var gameUserRatingView = new GameUserRatingView({
					el: $('.rating', itemElement),
					model: model.get('gameUserRatingModel')
				});
			}
			$('.rated', itemElement).text( i + 1 );
		});

		this.trigger('loadComplete');
		if ($(this.el).is(':visible')) {
			this.trigger('renderComplete');
		} else {
			this.show();
		}
	},

	/**
	 * Show list
	 *
	 * @returns Void
	 */
	show: function() {
		this.$el.show();
	},

	/**
	 * Get item HTML element
	 *
	 * @param index
	 * @returns jQuery|null
	 */
	getItemElement: function( index ){
		if( ! this.itemElements[index] ) {
			var elementSelector = this.itemElementSelectorTemplate.replace('%itemNumber%', index + 1);
			var element = $( elementSelector, this.el );
			if( ! element.length ) {
				return null;
			}
			this.itemElements[index] = element;
		}
		return this.itemElements[index];
	}
});