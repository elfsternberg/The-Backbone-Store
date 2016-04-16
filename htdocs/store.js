// Generated by CoffeeScript 1.10.0
(function() {
  var BackboneStore, CartWidget, Item, ItemCollection, Product, ProductCollection, ProductListView, ProductView, _BaseView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Product = (function(superClass) {
    extend(Product, superClass);

    function Product() {
      return Product.__super__.constructor.apply(this, arguments);
    }

    return Product;

  })(Backbone.Model);

  Item = (function(superClass) {
    extend(Item, superClass);

    function Item() {
      return Item.__super__.constructor.apply(this, arguments);
    }

    Item.prototype.update = function(amount) {
      if (amount === this.get('quantity')) {
        return;
      }
      this.set({
        quantity: amount
      }, {
        silent: true
      });
      return this.collection.trigger('update', this);
    };

    Item.prototype.price = function() {
      return this.get('product').get('price') * this.get('quantity');
    };

    return Item;

  })(Backbone.Model);

  ProductCollection = (function(superClass) {
    extend(ProductCollection, superClass);

    function ProductCollection() {
      return ProductCollection.__super__.constructor.apply(this, arguments);
    }

    ProductCollection.prototype.model = Product;

    ProductCollection.prototype.initialize = function(models, options) {
      return this.url = options.url;
    };

    ProductCollection.prototype.comparator = function(item) {
      return item.get('title');
    };

    return ProductCollection;

  })(Backbone.Collection);

  ItemCollection = (function(superClass) {
    extend(ItemCollection, superClass);

    function ItemCollection() {
      return ItemCollection.__super__.constructor.apply(this, arguments);
    }

    ItemCollection.prototype.model = Item;

    ItemCollection.prototype.updateItemForProduct = function(product, amount) {
      var i, pid;
      amount = amount != null ? amount : 0;
      pid = product.get('id');
      i = this.detect(function(obj) {
        return obj.get('product').get('id') === pid;
      });
      if (i) {
        i.update(amount);
        return i;
      }
      return this.add({
        product: product,
        quantity: amount
      });
    };

    ItemCollection.prototype.getTotalCount = function() {
      var addup;
      addup = function(memo, obj) {
        return memo + obj.get('quantity');
      };
      return this.reduce(addup, 0);
    };

    ItemCollection.prototype.getTotalCost = function() {
      var addup;
      addup = function(memo, obj) {
        return memo + obj.price();
      };
      return this.reduce(addup, 0);
    };

    return ItemCollection;

  })(Backbone.Collection);

  _BaseView = (function(superClass) {
    extend(_BaseView, superClass);

    function _BaseView() {
      return _BaseView.__super__.constructor.apply(this, arguments);
    }

    _BaseView.prototype.parent = $('#main');

    _BaseView.prototype.className = 'viewport';

    _BaseView.prototype.initialize = function() {
      this.el = $(this.el);
      this.el.hide();
      this.parent.append(this.el);
      return this;
    };

    _BaseView.prototype.hide = function() {
      var dfd;
      dfd = $.Deferred();
      if (!this.el.is(':visible')) {
        return dfd.resolve();
      }
      this.el.fadeOut('fast', function() {
        return dfd.resolve();
      });
      return dfd.promise();
    };

    _BaseView.prototype.show = function() {
      var dfd;
      dfd = $.Deferred();
      if (this.el.is(':visible')) {
        return dfd.resolve();
      }
      this.el.fadeIn('fast', function() {
        return dfd.resolve();
      });
      return dfd.promise();
    };

    return _BaseView;

  })(Backbone.View);

  ProductListView = (function(superClass) {
    extend(ProductListView, superClass);

    function ProductListView() {
      return ProductListView.__super__.constructor.apply(this, arguments);
    }

    ProductListView.prototype.id = 'productlistview';

    ProductListView.prototype.template = $("#store_index_template").html();

    ProductListView.prototype.initialize = function(options) {
      _BaseView.prototype.initialize.apply(this, [options]);
      return this.collection.bind('reset', this.render.bind(this));
    };

    ProductListView.prototype.render = function() {
      this.el.html(_.template(this.template)({
        'products': this.collection.toJSON()
      }));
      return this;
    };

    return ProductListView;

  })(_BaseView);

  ProductView = (function(superClass) {
    extend(ProductView, superClass);

    function ProductView() {
      return ProductView.__super__.constructor.apply(this, arguments);
    }

    ProductView.prototype.className = 'productitemview';

    ProductView.prototype.template = $("#store_item_template").html();

    ProductView.prototype.initialize = function(options) {
      _BaseView.prototype.initialize.apply(this, [options]);
      return this.itemcollection = options.itemcollection;
    };

    ProductView.prototype.events = {
      "keypress .uqf": "updateOnEnter",
      "click .uq": "update"
    };

    ProductView.prototype.update = function(e) {
      e.preventDefault();
      return this.itemcollection.updateItemForProduct(this.model, parseInt(this.$('.uqf').val()));
    };

    ProductView.prototype.updateOnEnter = function(e) {
      if (e.keyCode === 13) {
        return this.update(e);
      }
    };

    ProductView.prototype.render = function() {
      this.el.html(_.template(this.template)(this.model.toJSON()));
      return this;
    };

    return ProductView;

  })(_BaseView);

  CartWidget = (function(superClass) {
    extend(CartWidget, superClass);

    function CartWidget() {
      return CartWidget.__super__.constructor.apply(this, arguments);
    }

    CartWidget.prototype.el = $('.cart-info');

    CartWidget.prototype.template = $('#store_cart_template').html();

    CartWidget.prototype.initialize = function() {
      return this.collection.bind('update', this.render.bind(this));
    };

    CartWidget.prototype.render = function() {
      var tel;
      tel = this.$el.html(_.template(this.template)({
        'count': this.collection.getTotalCount(),
        'cost': this.collection.getTotalCost()
      }));
      tel.animate({
        paddingTop: '30px'
      }).animate({
        paddingTop: '10px'
      });
      return this;
    };

    return CartWidget;

  })(Backbone.View);

  BackboneStore = (function(superClass) {
    extend(BackboneStore, superClass);

    function BackboneStore() {
      return BackboneStore.__super__.constructor.apply(this, arguments);
    }

    BackboneStore.prototype.views = {};

    BackboneStore.prototype.products = null;

    BackboneStore.prototype.cart = null;

    BackboneStore.prototype.routes = {
      "": "index",
      "item/:id": "product"
    };

    BackboneStore.prototype.initialize = function(data) {
      this.cart = new ItemCollection();
      new CartWidget({
        collection: this.cart
      });
      this.products = new ProductCollection([], {
        url: 'data/items.json'
      });
      this.views = {
        '_index': new ProductListView({
          collection: this.products
        })
      };
      $.when(this.products.fetch({
        reset: true
      })).then(function() {
        return window.location.hash = '';
      });
      return this;
    };

    BackboneStore.prototype.hideAllViews = function() {
      return _.select(_.map(this.views, function(v) {
        return v.hide();
      }), function(t) {
        return t !== null;
      });
    };

    BackboneStore.prototype.index = function() {
      var view;
      view = this.views['_index'];
      return $.when.apply($, this.hideAllViews()).then(function() {
        return view.show();
      });
    };

    BackboneStore.prototype.product = function(id) {
      var base, name, product, view;
      product = this.products.detect(function(p) {
        return p.get('id') === id;
      });
      view = ((base = this.views)[name = 'item.' + id] || (base[name] = new ProductView({
        model: product,
        itemcollection: this.cart
      }).render()));
      return $.when(this.hideAllViews()).then(function() {
        return view.show();
      });
    };

    return BackboneStore;

  })(Backbone.Router);

  $(document).ready(function() {
    new BackboneStore();
    return Backbone.history.start();
  });

}).call(this);
