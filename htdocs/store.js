var Product = Backbone.Model.extend({});

var Item = Backbone.Model.extend({
    update: function(amount) {
        if (amount === this.get('quantity')) {
            return this;
        }
        this.set({quantity: amount}, {silent: true});
        this.collection.trigger('update', this);
        return this;
    },
    
    price: function() {
        return this.get('product').get('price') * this.get('quantity');
    }
});


var ProductCollection = Backbone.Collection.extend({
    model: Product,
    initialize: function(models, options) {
        this.url = options.url;
    },

    comparator: function(item) {
        return item.get('title');
    }
});


var ItemCollection = Backbone.Collection.extend({
    model: Item,

    updateItemForProduct: function(product, amount) {
        amount = amount != null ? amount : 0;
        var pid = product.get('id');
        var item = this.detect(function(obj) {
            return obj.get('product').get('id') === pid;
        });
        if (item) {
            item.update(amount);
            return item;
        }
        return this.add({
            product: product,
            quantity: amount
        });
    },

    getTotalCount: function() {
        var addup = function(memo, obj) {
            return memo + obj.get('quantity');
        };
        return this.reduce(addup, 0);
    },

    getTotalCost: function() {
        var addup = function(memo, obj) {
            return memo + obj.price();
        };
        return this.reduce(addup, 0);
    }
});

    
var BaseView = Backbone.View.extend({
    parent: $('#main'),
    className: 'viewport',

    initialize: function(options) {
        Backbone.View.prototype.initialize.apply(this, arguments);
        this.$el.hide();
        this.parent.append(this.el);
    },

    hide: function() {
        var dfd = $.Deferred();
        if (!this.$el.is(':visible')) {
            return dfd.resolve();
        }
        this.$el.fadeOut('fast', function() {
            return dfd.resolve();
        });
        return dfd.promise();
    },

    show: function() {
        var dfd = $.Deferred();
        if (this.$el.is(':visible')) {
            return dfd.resolve();
        }
        this.$el.fadeIn('fast', function() {
            return dfd.resolve();
        });
        return dfd.promise();
    }
});


var ProductListView = BaseView.extend({
    id: 'productlistview',
    template: _.template($("#store_index_template").html()),

    initialize: function(options) {
        BaseView.prototype.initialize.apply(this, arguments);
        this.collection.bind('reset', this.render.bind(this));
    },

    render: function() {
        this.$el.html(this.template({
            'products': this.collection.toJSON()
        }));
        return this;
    }
});


var ProductView = BaseView.extend({
    className: 'productitemview',
    template: _.template($("#store_item_template").html()),
    
    initialize: function(options) {
        BaseView.prototype.initialize.apply(this, [options]);
        this.itemcollection = options.itemcollection;
    },
        
    events: {
        "keypress .uqf" : "updateOnEnter",
        "click .uq"     : "update"
    },

    update: function(e) {
        e.preventDefault();
        return this.itemcollection.updateItemForProduct(this.model, parseInt(this.$('.uqf').val()));
    },

    updateOnEnter: function(e) {
        if (e.keyCode === 13) {
            this.update(e);
        }
    },

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});


var CartWidget = Backbone.View.extend({
    el: $('.cart-info'),
    template: _.template($('#store_cart_template').html()),

    initialize: function() {
        Backbone.View.prototype.initialize.apply(this, arguments);
        this.collection.bind('update', this.render.bind(this));
    },

    render: function() {
        var tel = this.$el.html(this.template({
            'count': this.collection.getTotalCount(),
            'cost': this.collection.getTotalCost()
        }));
        tel.animate({ paddingTop: '30px' }).animate({ paddingTop: '10px' });
        return this;
    }
});


var BackboneStore = Backbone.Router.extend({
    views: {},
    products: null,
    cart: null,

    routes: {
        "": "index",
        "item/:id": "product"
    },

    initialize: function(data) {
        Backbone.Router.prototype.initialize.apply(this, arguments);
        this.cart = new ItemCollection();
        new CartWidget({ collection: this.cart });
        this.products = new ProductCollection([], { url: 'data/items.json' });
        this.views = {
            '_index': new ProductListView({ collection: this.products })
        };
        $.when(this.products.fetch({ reset: true })).then(function() {
            return window.location.hash = '';
        });
    },

    hideAllViews: function() {
        return _.filter(_.map(this.views, function(v) { return v.hide(); }),
                        function(t) { return t !== null; });
    },

    index: function() {
        var view = this.views['_index'];
        return $.when.apply($, this.hideAllViews()).then(function() {
            return view.show();
        });
    },

    product: function(id) {
        var view = this.views[id];
        if (!view) {
            var product = this.products.detect(function(p) {
                return p.get('id') === id;
            });
            view = this.views[id] = new ProductView({
                model: product,
                itemcollection: this.cart
            }).render();
        }
        return $.when(this.hideAllViews()).then(function() {
            return view.show();
        });
    }
});


    $(document).ready(function() {
        new BackboneStore();
        return Backbone.history.start();
    });

