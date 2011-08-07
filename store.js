(function() {

    var Product = Backbone.Model.extend({})

    var ProductCollection = Backbone.Collection.extend({
        model: Product,

        initialize: function(models, options) {
            this.url = options.url;
        },

        comparator: function(item) {
            return item.get('title');
        }
    });

    var Item = Backbone.Model.extend({
        update: function(amount) {
            this.set({'quantity': this.get('quantity') + amount});
        }
    });

    var ItemCollection = Backbone.Collection.extend({
        model: Item,
        getOrCreateItemForProduct: function(product) {
            var i, 
            pid = product.get('id'),
            o = this.detect(function(obj) { 
                return (obj.get('product').get('id') == pid); 
            });
            if (o) { 
                return o;
            }
            i = new Item({'product': product, 'quantity': 0})
            this.add(i, {silent: true})
            return i;
        },
        getTotalCount: function() {
            return this.reduce(function(memo, obj) { 
                return obj.get('quantity') + memo; }, 0);
        },
        getTotalCost: function() {
            return this.reduce(function(memo, obj) { 
                return (obj.get('product').get('price') * 
                        obj.get('quantity')) + memo; }, 0);

        }
    });

    var _BaseView = Backbone.View.extend({
        parent: $('#main'),
        className: 'viewport',

        initialize: function() {
            this.el = $(this.el);
            this.el.hide();
            this.parent.append(this.el);
            return this;
        },

        hide: function() {
            if (this.el.is(":visible") === false) {
                return null;
            }
            promise = $.Deferred(_.bind(function(dfd) { 
                this.el.fadeOut('fast', dfd.resolve)}, this)).promise();
            this.trigger('hide', this);
            return promise;
        },

        show: function() {
            if (this.el.is(':visible')) {
                return;
            }       
            promise = $.Deferred(_.bind(function(dfd) { 
                this.el.fadeIn('fast', dfd.resolve) }, this)).promise();

            this.trigger('show', this);
            return promise;
        }
    });

    var ProductListView = _BaseView.extend({
        id: 'productlistview',
        template: $("#store_index_template").html(),

        initialize: function(options) {
            this.constructor.__super__.initialize.apply(this, [options])
            this.collection.bind('reset', _.bind(this.render, this));
        },

        render: function() {
            this.el.html(_.template(this.template, 
                                    {'products': this.collection.toJSON()}))
            return this;
        }
    });

    var ProductView = _BaseView.extend({
        id: 'productitemview',
        template: $("#store_item_template").html(),
        initialize: function(options) {
            this.constructor.__super__.initialize.apply(this, [options])
            this.itemcollection = options.itemcollection;
            this.item = this.itemcollection.getOrCreateItemForProduct(this.model);
            return this;
        },

        events: {
            "keypress .uqf" : "updateOnEnter",
            "click .uq"     : "update",
        },

        update: function(e) {
            e.preventDefault();
            this.item.update(parseInt($('.uqf').val()));
        },
        
        updateOnEnter: function(e) {
            if (e.keyCode == 13) {
                return this.update(e);
            }
        },

        render: function() {
            this.el.html(_.template(this.template, this.model.toJSON()));
            return this;
        }
    });

    var CartWidget = Backbone.View.extend({
        el: $('.cart-info'),
        template: $('#store_cart_template').html(),
        
        initialize: function() {
            this.collection.bind('change', _.bind(this.render, this));
        },
        
        render: function() {
            console.log(arguments);
            this.el.html(
                _.template(this.template, {
                    'count': this.collection.getTotalCount(),
                    'cost': this.collection.getTotalCost()
                })).animate({paddingTop: '30px'})
                .animate({paddingTop: '10px'});
        }
    });

    var BackboneStore = Backbone.Router.extend({
        views: {},
        products: null,
        cart: null,

        routes: {
            "": "index",
            "item/:id": "product",
        },

        initialize: function(data) {
            this.cart = new ItemCollection();
            new CartWidget({collection: this.cart});

            this.products = new ProductCollection([], {
                url: 'data/items.json'});
            this.views = {
                '_index': new ProductListView({
                    collection: this.products
                })
            };
            $.when(this.products.fetch({reset: true}))
                .then(function() { window.location.hash = ''; });
            return this;
        },

        hideAllViews: function () {
            return _.select(
                _.map(this.views, function(v) { return v.hide(); }), 
                function (t) { return t != null });
        },

        index: function() {
            var view = this.views['_index'];
            $.when(this.hideAllViews()).then(
                function() { return view.show(); });
        },

        product: function(id) {
            var product, v, view;
            product = this.products.detect(function(p) { return p.get('id') == (id); })
            view = ((v = this.views)['item.' + id]) || (v['item.' + id] = (
                new ProductView({model: product, 
                                 itemcollection: this.cart}).render()));
            $.when(this.hideAllViews()).then(
                function() { view.show(); });
        }
    });

    $(document).ready(function() {
        new BackboneStore();
        Backbone.history.start();
    });
}).call(this);
