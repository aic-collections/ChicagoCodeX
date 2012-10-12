OsciTk.views.Figures = OsciTk.views.BaseView.extend({
	id: 'figures',
	template: OsciTk.templateManager.get('aic-figures'),
	events: {
		"click #figures-handle": "toggleDrawer",
		"click a.view-fullscreen": "onFigurePreviewClicked",
		"click a.view-in-context": "onViewInContextClicked",
		"click #figures-nav-next .figures-indicator": "onNextPageClicked",
		"click #figures-nav-prev .figures-indicator": "onPrevPageClicked"
	},
	initialize: function() {
		this.isOpen = false;
		this.isActive = false;
		this.collection = app.collections.figures;
		this.page = 1;
		this.maxPage = 1;

		// draw the figures ui only if figures become available
		app.dispatcher.on('figuresLoaded', function(figures) {
			this.render();
		}, this);

		// close the drawer when requested
		app.dispatcher.on('drawersClose', function(caller) {
			if (caller !== this && this.isOpen === true) {
				this.closeDrawer();
			}
		}, this);

		// move the drawer handle when the table of contents opens or closes
		app.dispatcher.on('tocOpening', function() {
			var handle = this.$el.find('#figures-handle');
			var left = parseInt(handle.css('left'), 10);
			handle.animate({'left': (left + 200) + 'px'});
		}, this);
		app.dispatcher.on('tocClosing', function() {
			var handle = this.$el.find('#figures-handle');
			var left = parseInt(handle.css('left'), 10);
			handle.animate({'left': (left - 200) + 'px'});
		}, this);

		app.dispatcher.on("windowResized", function() {
			this.render();
		}, this);

		// listen for other tabs going active
		app.dispatcher.on('tabActive', function(caller) {
			if (caller !== this) {
				this.setInactive();
			}
		}, this);
		
		// listen for other tabs opening or closing
		app.dispatcher.on('tabOpening', function(caller) {
			if (caller !== this) {
				this.openDrawer();
			}
		}, this);
		app.dispatcher.on('tabClosing', function(caller) {
			if (caller !== this) {
				this.closeDrawer();
			}
		}, this);
	},
	render: function() {
		this.$el.css('display', 'block');
		// prepare data for display, getting a sorted copy of the figures collection
		var data = {
			figures: this.collection.sortBy(function(figure) {
				var figNum = figure.get('title').toLowerCase();
				var matches = figNum.match(/fig. (\d+)/);
				if (matches.length < 2) {
					return 0;
				}
				return parseInt(matches[1], 10);
			})
		};
		this.$el.html(this.template(data));

		// set figures list width
		var itemWidth = this.$el.find('#figures-list li').outerWidth();
		var itemCount = this.collection.length;
		this.$el.find('#figures-list').width(itemWidth * itemCount);
		
		// justify contents across container width
		var containerWidth = this.$el.find('#figures-list-container').width();
		var numToFit = Math.floor(containerWidth / itemWidth);
		var paddingToAdd = (containerWidth - (numToFit * itemWidth)) / numToFit;
		var leftPadding = parseInt(this.$el.find('#figures-list li').css('padding-left'), 10);
		var rightPadding = parseInt(this.$el.find('#figures-list li').css('padding-right'), 10);
		var currentPadding = leftPadding + rightPadding;
		var newPadding = Math.floor((currentPadding + paddingToAdd) / 2);
		var extra = 0;
		if ((newPadding * 2) < (currentPadding + paddingToAdd)) {
			extra = ((currentPadding + paddingToAdd) - (newPadding * 2)) * numToFit;
		}
		this.$el.find('#figures-list li').css({
			'padding-left': newPadding + 'px',
			'padding-right': newPadding + 'px'
		});
		this.$el.find('#figures-list li:nth-child('+numToFit+'n+'+numToFit+')').css({
			'padding-right': newPadding + extra + 'px'
		});

		// item width has changed, get it again
		itemWidth = this.$el.find('#figures-list li').outerWidth();
		
		// reset list width now that padding has been added
		this.$el.find('#figures-list').width((itemWidth + paddingToAdd) * itemCount);

		// set the max page value
		this.maxPage = Math.ceil((itemWidth * itemCount) / containerWidth);
	},
	onFigurePreviewClicked: function(event_data) {
		var figId = $(event_data.target).parent('figure').attr('data-figure-id');
		var figureView = app.views.figures[figId];
		if (figureView && figureView.fullscreen) {
			figureView.fullscreen();
		}
		return false;
	},
	onViewInContextClicked: function(event_data) {
		console.log(event_data, 'event_data');
		
		// find the figure identifier
		figId = $(event_data.target).parent().attr('data-figure-id');
		console.log(figId, 'figId');
		// find the reference elements that match this figId
		figRefs = app.views.sectionView.$el.find('a.figure_reference[href="#'+figId+'"]');
		console.log(figRefs, 'figRefs');

		// determine which of these elements are currently visible
		var visibleRefs = [];
		_.each(figRefs, function(figRef) {
			console.log(figRef, 'figure reference');
			var visible = app.views.sectionView.isElementVisible(figRef);
			if (visible) {
				visibleRefs.push(figRef);
			}
		}, this);

		if (visibleRefs.length > 0) {
			// navigate to the first instance and highlight
			this.navigateAndHighlightRef(visibleRefs, 0);
			// clean up the interface
			this.closeDrawer();
			if (app.views.footnotesView) {
				app.views.footnotesView.closeDrawer();
			}
		}
		return false;
	},
	navigateAndHighlightRef: function(visibleRefs, index) {
		index = index || 0;
		// navigate to figure reference
		app.dispatcher.trigger('navigate', { identifier: figId + '-' + (index + 1) });
		
		var ref = $(visibleRefs[index]);
		this.pulsateText(ref);
	},
	pulsateText: function(element) {
		var offset = element.offset(),
			width = element.width(),
			temp = $("<div>", {
				css : {
					position : "absolute",
					top : (offset.top - 90) + "px",
					left : offset.left - 160 + (width / 2) + "px",
					margin : 0,
					width : "80px",
					height : "80px",
					border : "6px solid #F00",
					"border-radius" : "46px",
					"-webkit-animation-duration" : "400ms",
					"-webkit-animation-iteration-count" : "3",
					"-webkit-animation-name" : "pulse",
					"-webkit-animation-direction" : "normal",
					"-webkit-box-shadow": "0px 0px 10px #888"
				}
			}).appendTo("#section");
		console.log(offset, 'offset');
		console.log(width, 'width');
		console.log(temp, 'temp');
		
		setTimeout(function(){temp.remove();}, 1100);
	},
	translateToPage: function() {
		var width = this.$el.find('#figures-list-container').width();
		var list = this.$el.find('#figures-list');
		var pos = -(width * (this.page - 1));
		list.css({
			'-webkit-transform': 'translate3d(' + pos + 'px, 0px, 0px)'
		});
	},
	onNextPageClicked: function() {
		if (this.page < this.maxPage) {
			this.page++;
			this.translateToPage();
		}
	},
	onPrevPageClicked: function() {
		if (this.page > 1) {
			this.page--;
			this.translateToPage();
		}
	},
	toggleDrawer: function() {
		if (this.isOpen) {
			if (this.isActive) {
				// close drawer
				app.dispatcher.trigger('tabClosing', this);
				this.closeDrawer();
			}
			else {
				// make active
				this.setActive();
			}
		}
		else {
			// open drawer and make active
			app.dispatcher.trigger('tabOpening', this);
			this.openDrawer();
			this.setActive();
		}
	},
	openDrawer: function() {
		// tell toc drawer to close
		app.dispatcher.trigger('tocClose');
		this.$el.find('#figures-content').animate({
			height: '300px'
		});
		this.isOpen = true;
	},
	closeDrawer: function() {
		var $this = this;
		this.$el.find('#figures-content').animate({
			height: '0'
		}, null, null, function() {
			$this.setInactive();
		});
		this.isOpen = false;
	},
	setActive: function() {
		app.dispatcher.trigger('tabActive', this);
		this.$el.css({'z-index': '101'});
		this.isActive = true;
	},
	setInactive: function() {
		this.$el.css({'z-index': '100'});
		this.isActive = false;
	}
});