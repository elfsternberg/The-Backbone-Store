class Product extends Backbone.Model

class ProductCollection extends Backbone.Collection
    model: Product

    initialize: (models, options) ->
        @url = options.url
        @

    comparator: (item) ->
        item.get('title')

class Item extends Backbone.Model
    update: (amount) ->
        @set
            quantity: @get('quantity')

    price: () ->
        @get('product').get('price') * @get('quantity')

class ItemCollection extends Backbone.Collection
    model: Item

    getOrCreateItemForProduct: (product) ->
        pid = product.get('id')
        i = this.detect (obj) -> (obj.get('product').get('id') == pid)
        if (i)
            return i
        i = new Item
            product: product
            quantity: 0
        @add i, {silent: true}
        i

    getTotalCount: () ->
        addup = (memo, obj) -> obj.get('quantity') + memo
        @reduce addup, 0

    getTotalCost: () ->
        addup = (memo, obj) ->obj.price() + memo
        @reduce(addup, 0);


class _BaseView extends Backbone.View
    parent: $('#main')
    className: 'viewport'

    initialize: () ->
        @el = $(@el)
        @el.hide()
        @parent.append(@el)
        @

    hide: () ->
        if not @el.is(':visible')
            return null
        promise = $.Deferred (dfd) => @el.fadeOut('fast', dfd.resolve)
        promise.promise()

    show: () ->
        if @el.is(':visible')
            return

        promise = $.Deferred (dfd) => @el.fadeIn('fast', dfd.resolve)
        promise.promise()


class ProductListView extends _BaseView
    id: 'productlistview'
    template: $("#store_index_template").html()

    initialize: (options) ->
        @constructor.__super__.initialize.apply @, [options]
        @collection.bind 'reset', _.bind(@render, @)

    render: () ->
        @el.html(_.template(@template, {'products': @collection.toJSON()}))
        @


class ProductView extends _BaseView
    id: 'productitemview'
    template: $("#store_item_template").html()
    initialize: (options) ->
            @constructor.__super__.initialize.apply @, [options]
            @itemcollection = options.itemcollection
            @item = @itemcollection.getOrCreateItemForProduct @model
            @

    events:
        "keypress .uqf" : "updateOnEnter"
        "click .uq"     : "update"

    update: (e) ->
        e.preventDefault()
        @item.update parseInt(@$('.uqf').val())

    updateOnEnter: (e) ->
        if (e.keyCode == 13)
            @update e

    render: () ->
        @el.html(_.template(@template, @model.toJSON()));
        @


class CartWidget extends Backbone.View
    el: $('.cart-info')
    template: $('#store_cart_template').html()

    initialize: () ->
        @collection.bind('change', _.bind(@render, @));

    render: () ->
        tel = @el.html _.template @template,
            'count': @collection.getTotalCount()
            'cost': @collection.getTotalCost()
        tel.animate({paddingTop: '30px'}).animate({paddingTop: '10px'})
        @


class BackboneStore extends Backbone.Router
    views: {}
    products: null
    cart: null

    routes:
        "": "index"
        "item/:id": "product"

    initialize: (data) ->
        @cart = new ItemCollection()
        new CartWidget
            collection: @cart

        @products = new ProductCollection [],
            url: 'data/items.json'
        @views =
            '_index': new ProductListView
                collection: @products
        $.when(@products.fetch({reset: true}))
            .then(() -> window.location.hash = '')
        @

    hideAllViews: () ->
        _.select(_.map(@views, (v) -> return v.hide()),
            (t) -> t != null)


    index: () ->
        view = @views['_index']
        $.when(@hideAllViews()).then(() -> view.show())

    product: (id) ->
        product = @products.detect (p) -> p.get('id') == (id)
        view = (@views['item.' + id] ||= new ProductView(
            model: product,
            itemcollection: @cart
        ).render())
        $.when(@hideAllViews()).then(
            () -> view.show())


$(document).ready () ->
    new BackboneStore();
    Backbone.history.start();
