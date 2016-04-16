class Product extends Backbone.Model

class Item extends Backbone.Model
    update: (amount) ->
        return if amount == @get 'quantity'
        @set {quantity: amount}, {silent: true}
        @collection.trigger 'update', @

    price: () ->
        @get('product').get('price') * @get('quantity')

class ProductCollection extends Backbone.Collection
    model: Product

    initialize: (models, options) ->
        @url = options.url

    comparator: (item) ->
        item.get 'title'

class ItemCollection extends Backbone.Collection
    model: Item

    updateItemForProduct: (product, amount) ->
        amount = if amount? then amount else 0
        pid = product.get 'id'
        i = this.detect (obj) -> (obj.get('product').get('id') == pid)
        if i
            i.update(amount)
            return i

        @add {product: product, quantity: amount}

    getTotalCount: () ->
        addup = (memo, obj) -> memo + obj.get 'quantity'
        @reduce addup, 0

    getTotalCost: () ->
        addup = (memo, obj) -> memo + obj.price() 
        @reduce addup, 0

    
class _BaseView extends Backbone.View
    parent: $('#main')
    className: 'viewport'

    initialize: () ->
        @el = $(@el)
        @el.hide()
        @parent.append(@el)
        @

    hide: () ->
        dfd = $.Deferred()
        if not @el.is(':visible')
            return dfd.resolve()
        @el.fadeOut('fast', () -> dfd.resolve())
        dfd.promise()

    show: () ->
        dfd = $.Deferred()
        if @el.is(':visible')
            return dfd.resolve()
        @el.fadeIn('fast', () -> dfd.resolve())
        dfd.promise()


class ProductListView extends _BaseView
    id: 'productlistview'
    template: $("#store_index_template").html()

    initialize: (options) ->
        _BaseView.prototype.initialize.apply @, [options]
        @collection.bind 'reset', @render.bind @

    render: () ->
        @el.html(_.template(@template)({'products': @collection.toJSON()}))
        @


class ProductView extends _BaseView
    className: 'productitemview'
    template: $("#store_item_template").html()
    initialize: (options) ->
        _BaseView.prototype.initialize.apply @, [options]
        @itemcollection = options.itemcollection
        
    events:
        "keypress .uqf" : "updateOnEnter"
        "click .uq"     : "update"

    update: (e) ->
        e.preventDefault()
        @itemcollection.updateItemForProduct @model, parseInt(@$('.uqf').val())

    updateOnEnter: (e) ->
        @update(e) if e.keyCode == 13

    render: () ->
        @el.html(_.template(@template)(@model.toJSON()));
        @


class CartWidget extends Backbone.View
    el: $('.cart-info')
    template: $('#store_cart_template').html()

    initialize: () ->
        @collection.bind 'update', @render.bind @

    render: () ->
        tel = @$el.html _.template(@template)({
            'count': @collection.getTotalCount()
            'cost': @collection.getTotalCost()
        })
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
        $.when.apply($, @hideAllViews()).then(() -> view.show())

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
