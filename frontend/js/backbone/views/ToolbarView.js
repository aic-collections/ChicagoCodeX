// Aic Namespace Initialization //
if (typeof Aic === 'undefined'){Aic = {};}
if (typeof Aic.views === 'undefined'){Aic.views = {};}
// Aic Namespace Initialization //

Aic.views.Toolbar = OsciTk.views.BaseView.extend({
	id: 'toolbar',
	template: OsciTk.templateManager.get('toolbar'),
	initialize: function() {
		// if toolbar items were provided, store them in the view
		this.toolbarItems = app.config.get('toolbarItems') ? app.config.get('toolbarItems') : [];
		this.toolbarItemViews = [];
		this.render();
		
		// put publication title in place once it is available
		app.dispatcher.bind('packageLoaded', function(docPackage) {
			var title = docPackage.get('metadata')['dc:title']['value'];
			this.$el.find('#toolbar-pub-title').html(title);
		}, this);
	},
	render: function() {
		this.$el.html(this.template());
		_.each(this.toolbarItems, function(toolbarItem) {
			var item = new Aic.views.ToolbarItem({toolbarItem: toolbarItem});
			this.toolbarItemViews.push(item);
			this.addView(item, '#toolbar-items');
			item.render();
		}, this);
	}
});