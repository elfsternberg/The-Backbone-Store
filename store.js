var Product = Backbone.Model.extend({});

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
    getByPid: function(pid) {
        return this.detect(function(obj) { return (obj.get('product').cid == pid); });
    },
});

var CartView = Backbone.View.extend({
    el: $('.cart-info'),

    initialize: function() {
        this.model.bind('change', _.bind(this.render, this));
    },

    render: function() {
        var sum = this.model.reduce(function(m, n) { return m + n.get('quantity'); }, 0);
        this.el
            .find('.cart-items').text(sum).end()
            .animate({paddingTop: '30px'})
            .animate({paddingTop: '10px'});
    }
});

var ProductView = Backbone.View.extend({
    el: $('#main'),
    itemTemplate: $("#itemTmpl").template(),

    events: {
        "keypress .uqf" : "updateOnEnter",
        "click .uq"     : "update",
    },

    initialize: function(options) {
        this.cart = options.cart;
    },

    update: function(e) {
        e.preventDefault();
        var cart_item = this.cart.getByPid(this.model.cid);
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

    render: function() {
        var sg = this;
        this.el.fadeOut('fast', function() {
            sg.el.empty();
            $.tmpl(sg.itemTemplate, sg.model).appendTo(sg.el);
            sg.el.fadeIn('fast');
        });
        return this;
    }
});


var IndexView = Backbone.View.extend({
    el: $('#main'),
    indexTemplate: $("#indexTmpl").template(),

    render: function() {
        var sg = this;
        this.el.fadeOut('fast', function() {
            sg.el.empty();
            $.tmpl(sg.indexTemplate, sg.model.toArray()).appendTo(sg.el);
            sg.el.fadeIn('fast');
        });
        return this;
    }

});

var Workspace = Backbone.Controller.extend({
    _index: null,
    _products: null,
    _cart :null,

    routes: {
        "": "index",
        "item/:id": "item",
    },

    initialize: function() {
        var ws = this;
        if (this._index === null) {
            $.ajax({
                url: 'data/items.json',
                dataType: 'json',
                data: {},
                success: function(data) {
                    ws._cart = new Cart();
                    new CartView({model: ws._cart});
                    ws._products = new ProductCollection(data);
                    ws._index = new IndexView({model: ws._products});
                    Backbone.history.loadUrl();
                }
            });
            return this;
        }
        return this;
    },

    index: function() {
        this._index.render();
    },

    item: function(id) {
        if (_.isUndefined(this._products.getByCid(id)._view)) {
            this._products.getByCid(id)._view = new ProductView({model: this._products.getByCid(id),
                                                                 cart: this._cart});
        }
        this._products.getByCid(id)._view.render();
    }
});

workspace = new Workspace();
Backbone.history.start();
