(function() {
  var BackboneStore, CartWidget, Item, ItemCollection, Product, ProductCollection, ProductListView, ProductView, _BaseView;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Product = (function() {
    __extends(Product, Backbone.Model);
    function Product() {
      Product.__super__.constructor.apply(this, arguments);
    }
    return Product;
  })();
  ProductCollection = (function() {
    __extends(ProductCollection, Backbone.Collection);
    function ProductCollection() {
      ProductCollection.__super__.constructor.apply(this, arguments);
    }
    ProductCollection.prototype.model = Product;
    ProductCollection.prototype.initialize = function(models, options) {
      this.url = options.url;
      return this;
    };
    ProductCollection.prototype.comparator = function(item) {
      return item.get('title');
    };
    return ProductCollection;
  })();
  Item = (function() {
    __extends(Item, Backbone.Model);
    function Item() {
      Item.__super__.constructor.apply(this, arguments);
    }
    Item.prototype.update = function(amount) {
      return this.set({
        quantity: this.get('quantity')
      });
    };
    Item.prototype.price = function() {
      return this.get('product').get('price') * this.get('quantity');
    };
    return Item;
  })();
  ItemCollection = (function() {
    __extends(ItemCollection, Backbone.Collection);
    function ItemCollection() {
      ItemCollection.__super__.constructor.apply(this, arguments);
    }
    ItemCollection.prototype.model = Item;
    ItemCollection.prototype.getOrCreateItemForProduct = function(product) {
      var i, pid;
      pid = product.get('id');
      i = this.detect(function(obj) {
        return obj.get('product').get('id') === pid;
      });
      if (i) {
        return i;
      }
      i = new Item({
        product: product,
        quantity: 0
      });
      this.add(i, {
        silent: true
      });
      return i;
    };
    ItemCollection.prototype.getTotalCount = function() {
      var addup;
      addup = function(memo, obj) {
        return obj.get('quantity') + memo;
      };
      return this.reduce(addup, 0);
    };
    ItemCollection.prototype.getTotalCost = function() {
      var addup;
      addup = function(memo, obj) {
        return obj.price() + memo;
      };
      return this.reduce(addup, 0);
    };
    return ItemCollection;
  })();
  _BaseView = (function() {
    __extends(_BaseView, Backbone.View);
    function _BaseView() {
      _BaseView.__super__.constructor.apply(this, arguments);
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
      var promise;
      if (!this.el.is(':visible')) {
        return null;
      }
      promise = $.Deferred(__bind(function(dfd) {
        return this.el.fadeOut('fast', dfd.resolve);
      }, this));
      return promise.promise();
    };
    _BaseView.prototype.show = function() {
      var promise;
      if (this.el.is(':visible')) {
        return;
      }
      promise = $.Deferred(__bind(function(dfd) {
        return this.el.fadeIn('fast', dfd.resolve);
      }, this));
      return promise.promise();
    };
    return _BaseView;
  })();
  ProductListView = (function() {
    __extends(ProductListView, _BaseView);
    function ProductListView() {
      ProductListView.__super__.constructor.apply(this, arguments);
    }
    ProductListView.prototype.id = 'productlistview';
    ProductListView.prototype.template = $("#store_index_template").html();
    ProductListView.prototype.initialize = function(options) {
      this.constructor.__super__.initialize.apply(this, [options]);
      return this.collection.bind('reset', _.bind(this.render, this));
    };
    ProductListView.prototype.render = function() {
      this.el.html(_.template(this.template, {
        'products': this.collection.toJSON()
      }));
      return this;
    };
    return ProductListView;
  })();
  ProductView = (function() {
    __extends(ProductView, _BaseView);
    function ProductView() {
      ProductView.__super__.constructor.apply(this, arguments);
    }
    ProductView.prototype.id = 'productitemview';
    ProductView.prototype.template = $("#store_item_template").html();
    ProductView.prototype.initialize = function(options) {
      this.constructor.__super__.initialize.apply(this, [options]);
      this.itemcollection = options.itemcollection;
      this.item = this.itemcollection.getOrCreateItemForProduct(this.model);
      return this;
    };
    ProductView.prototype.events = {
      "keypress .uqf": "updateOnEnter",
      "click .uq": "update"
    };
    ProductView.prototype.update = function(e) {
      e.preventDefault();
      return this.item.update(parseInt(this.$('.uqf').val()));
    };
    ProductView.prototype.updateOnEnter = function(e) {
      if (e.keyCode === 13) {
        return this.update(e);
      }
    };
    ProductView.prototype.render = function() {
      this.el.html(_.template(this.template, this.model.toJSON()));
      return this;
    };
    return ProductView;
  })();
  CartWidget = (function() {
    __extends(CartWidget, Backbone.View);
    function CartWidget() {
      CartWidget.__super__.constructor.apply(this, arguments);
    }
    CartWidget.prototype.el = $('.cart-info');
    CartWidget.prototype.template = $('#store_cart_template').html();
    CartWidget.prototype.initialize = function() {
      return this.collection.bind('change', _.bind(this.render, this));
    };
    CartWidget.prototype.render = function() {
      var tel;
      tel = this.el.html(_.template(this.template, {
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
  })();
  BackboneStore = (function() {
    __extends(BackboneStore, Backbone.Router);
    function BackboneStore() {
      BackboneStore.__super__.constructor.apply(this, arguments);
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
      return $.when(this.hideAllViews()).then(function() {
        return view.show();
      });
    };
    BackboneStore.prototype.product = function(id) {
      var product, view, _base, _name;
      product = this.products.detect(function(p) {
        return p.get('id') === id;
      });
      view = ((_base = this.views)[_name = 'item.' + id] || (_base[_name] = new ProductView({
        model: product,
        itemcollection: this.cart
      }).render()));
      return $.when(this.hideAllViews()).then(function() {
        return view.show();
      });
    };
    return BackboneStore;
  })();
  $(document).ready(function() {
    new BackboneStore();
    return Backbone.history.start();
  });
}).call(this);
