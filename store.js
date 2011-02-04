(function() {

    var Product = Backbone.Model.extend({
        toJSON: function() {
            return _.extend(_.clone(this.attributes), {cid: this.cid})
        }
    });

    var ProductCollection = Backbone.Collection.extend({
        model: Product,

        comparator: function(item) {
            return item.get('title');
        }
    });

    var CartItem = Backbone.Model.extend({
        update: function(amount) {
            this.set({'quantity': this.get('quantity') + amount});
        }
    });

    var Cart = Backbone.Collection.extend({
        model: CartItem,
        getByProductId: function(pid) {
            return this.detect(function(obj) { return (obj.get('product').cid == pid); });
        },
    });


    var CartView = Backbone.View.extend({
        el: $('.cart-info'),
        
        initialize: function() {
            this.collection.bind('change', _.bind(this.render, this));
        },
        
        render: function() {
            var sum = this.collection.reduce(function(m, n) { return m + n.get('quantity'); }, 0);
            this.el
                .find('.cart-items').text(sum).end()
                .animate({paddingTop: '30px'})
                .animate({paddingTop: '10px'});
        }
    });


    var ProductListView = Backbone.View.extend({
        el: $('#main'),
        indexTemplate: $("#indexTmpl").template(),
        
        render: function() {
            var self = this;
            this.el.fadeOut('fast', function() {
                self.el.html($.tmpl(self.indexTemplate, self.model.toJSON()));
                self.el.fadeIn('fast');
            });
            return this;
        }
    });


    var ProductView = Backbone.View.extend({
        el: $('#main'),
        itemTemplate: $("#itemTmpl").template(),

        initialize: function(options) {
            this.cart = options.cart;
            return this;
        },
        
        update: function(e) {
            e.preventDefault();
            var cart_item = this.cart.getByProductId(this.model.cid);
            if (_.isUndefined(cart_item)) {
                cart_item = new CartItem({product: this.model, quantity: 0});
                this.cart.add(cart_item, {silent: true});
            }
            cart_item.update(parseInt($('.uqf').val()));
        },
        
        updateOnEnter: function(e) {
            if (e.keyCode == 13) {
                return this.update(e);
            }
        },

        events: {
            "keypress .uqf" : "updateOnEnter",
            "click .uq"     : "update",
        },

        render: function() {
            var self = this;
            this.el.fadeOut('fast', function() {
                self.el.html($.tmpl(self.itemTemplate, self.model.toJSON()));
                self.el.fadeIn('fast');
            });
            return this;
        }
    });


    var BackboneStore = Backbone.Controller.extend({
        _index: null,
        _products: null,
        _cart :null,
        routes: {
            "": "index",
            "item/:id": "item",
        },

        initialize: function(data) {
            this._cart = new Cart();
            new CartView({collection: this._cart});
            this._products = new ProductCollection(data);
            this._index = new ProductListView({model: this._products});
            return this;
        },

        index: function() {
            this._index.render();
        },

        item: function(id) {
            var product = this._products.getByCid(id);
            if (_.isUndefined(product._view)) {
                product._view = new ProductView({model: product,
                                                 cart: this._cart});
            }
            product._view.render();
        }
    });


    $(document).ready(function() {
        var fetch_items = function() {
            return $.ajax({
                url: 'data/items.json',
                data: {},
                contentType: "application/json; charset=utf-8",
                dataType: "json"
            });
        };

        $.when(fetch_items()).then(function(data) {
            new BackboneStore(data);
            Backbone.history.start();
        });
    });

}).call(this);
