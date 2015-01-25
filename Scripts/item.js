var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Item;
(function (_Item) {
    (function (ItemState) {
        ItemState[ItemState["NewlyCreated"] = 0] = "NewlyCreated";
        ItemState[ItemState["Deleted"] = 1] = "Deleted";
        ItemState[ItemState["Modified"] = 2] = "Modified";
        ItemState[ItemState["Unchanged"] = 3] = "Unchanged";
    })(_Item.ItemState || (_Item.ItemState = {}));
    var ItemState = _Item.ItemState;
    var Item = (function () {
        function Item(stored) {
            this.id = stored.id;
            this.name = stored.name;
            this.state = stored.state;
            this.bought = stored.bought;
            this.market = stored.market;
            this.created = stored.created;
            this.priority = stored.priority || 0;
            this.description = stored.description;
            if (stored.priority === undefined)
                if (this.state == 3 /* Unchanged */)
                    this.state = 2 /* Modified */;
            if (typeof (this.created) == 'string')
                this.created = new Date((this.created));
            if (typeof (this.bought) == 'string')
                this.bought = new Date((this.bought));
        }
        Item.prototype.appendTo = function (items, list) {
            var _this = this;
            if (this.state == 1 /* Deleted */)
                return;
            var seq = 'itm' + (++Item.nextCount);
            var checker = $('<input/>', { type: 'checkbox', name: seq, id: seq });
            checker.prop('checked', this.bought != null);
            checker.on('change', function (ev) { return _this.onClick(ev, list, checker); });
            var name = this.name;
            if ((this.market || '') != '')
                name = this.market + ': ' + name;
            var label = $('<label/>', { text: name, title: this.description, 'for': seq });
            label.on('swipeleft', function () { return list.moveItem(_this, false); });
            label.on('swiperight', function () { return list.moveItem(_this, true); });
            items.append(checker, label);
        };
        Item.prototype.onClick = function (ev, list, checker) {
            if (TheApplication.activeMarket == null) {
                TheApplication.itemScope = this;
                $.mobile.pageContainer.pagecontainer("change", Details.pageName, { transition: 'none' });
            }
            else {
                if (checker.is(':checked')) {
                    this.market = TheApplication.activeMarket.name;
                    this.bought = new Date($.now());
                }
                else {
                    this.market = null;
                    this.bought = null;
                }
                if (this.state == 3 /* Unchanged */)
                    this.state = 2 /* Modified */;
                list.save();
            }
        };
        Item.nextCount = 0;
        return Item;
    })();
    var List = (function (_super) {
        __extends(List, _super);
        function List() {
            var _this = this;
            _super.call(this, List.pageName, '#products', '#newItem');
            this.settings = $('#settings');
            this.header = this.page.find('[data-role=header] h1');
            this.shopping = this.page.find('#goShopping');
            this.filter = this.page.find('#showAll');
            this.sync = this.page.find('#syncItems');
            this.dialog = $('#register');
            this.userId = this.dialog.find('input');
            this.register = this.dialog.find('a');
            var someFilter = this.page.find('#showSome');
            var settings = this.page.find('#openSettings');
            var reregister = this.settings.find('#newRegister');
            this.filter.on('change', function () { return _this.refreshPage(); });
            someFilter.on('change', function () { return _this.refreshPage(); });
            this.shopping.on('click', function () { return _this.onBuy(); });
            this.sync.on('click', function () { return _this.synchronize(); });
            this.dialog.popup();
            this.settings.enhanceWithin().popup({ positionTo: settings.selector });
            this.register.on('click', function () { return _this.tryRegister(); });
            settings.on('click', function () { return _this.showSettings(); });
            reregister.on('click', function () { return _this.reRegister(); });
            this.loadFromStorage();
            this.refreshPage();
        }
        List.prototype.createNew = function () {
            TheApplication.itemScope = null;
        };
        List.prototype.showSettings = function () {
            if (this.userId.val() == '')
                this.userId.val(User.getUserId());
            this.settings.popup({ afterclose: null });
            this.settings.popup('open');
        };
        List.prototype.moveItem = function (item, forward) {
            var index = this.items.indexOf(item);
            if (index < 0)
                return;
            var newIndex = index + (forward ? +1 : -1);
            if (newIndex < 0)
                return;
            if (newIndex >= this.items.length)
                return;
            var nextItem = this.items[newIndex];
            if (nextItem.state == 3 /* Unchanged */)
                nextItem.state = 2 /* Modified */;
            if (item.state == 3 /* Unchanged */)
                item.state = 2 /* Modified */;
            this.items[index] = nextItem;
            this.items[newIndex] = item;
            this.save();
            this.refreshPage();
        };
        List.prototype.tryRegister = function () {
            var _this = this;
            TheApplication.disable(this.register);
            var userId = this.userId.val().trim();
            User.getUser(userId).done(function (userNameInfo) {
                _this.dialog.popup('close');
                if (typeof (userNameInfo) == 'string') {
                    TheApplication.disable(_this.sync);
                }
                else if (userNameInfo.name.length > 0) {
                    User.setUserId(userId, userNameInfo.name);
                    _this.refreshPage();
                    _this.onSynchronize();
                }
            });
        };
        List.prototype.reRegister = function () {
            var _this = this;
            this.settings.popup({ afterclose: function () { return window.setTimeout(function () { return _this.showRegistration(); }, 10); } });
            this.settings.popup('close');
        };
        List.prototype.showRegistration = function () {
            TheApplication.enable(this.register);
            this.dialog.popup('open');
        };
        List.prototype.synchronize = function () {
            if (User.getUserId().length < 1) {
                this.showRegistration();
            }
            else {
                this.onSynchronize();
            }
        };
        List.prototype.onSynchronize = function () {
            var _this = this;
            TheApplication.disable(this.sync);
            this.updateDatabase().done(function (itemList) {
                if (typeof (itemList) == 'string')
                    return;
                _this.items = $.map(itemList.items, function (stored) { return new Item(stored); });
                _this.save();
                TheApplication.getMarkets().update(itemList.markets);
                TheApplication.enable(_this.sync);
                _this.refreshPage();
            });
        };
        List.prototype.updateDatabase = function () {
            $.each(this.items, function (index, item) { return item.priority = index; });
            var items = this.items.filter(function (item) { return item.state != 3 /* Unchanged */; });
            var markets = TheApplication.getMarkets().markets.filter(function (market) { return market.deleted || (market.name != market.originalName); });
            return $.ajax({
                data: JSON.stringify({ userid: User.getUserId(), items: items, markets: markets }),
                contentType: 'application/json',
                url: 'sync.php',
                type: 'POST',
            });
        };
        List.prototype.refreshPage = function () {
            var _this = this;
            this.list.empty();
            var all = this.filter.is(':checked');
            $.each(this.items, function (i, item) {
                if (all || (item.bought == null))
                    item.appendTo(_this.list, _this);
            });
            this.list.trigger('create');
            var market = TheApplication.activeMarket;
            if (market == null) {
                var userName = User.getUserName();
                this.header.text((userName == '') ? 'Deine Einkaufsliste' : userName);
                this.shopping.text('Einkaufen');
                TheApplication.enable(this.sync);
            }
            else {
                this.header.text('Einkaufen bei ' + market.name);
                this.shopping.text('Einkaufen beenden');
                TheApplication.disable(this.sync);
            }
        };
        List.prototype.save = function () {
            localStorage[List.storageKey] = JSON.stringify(this.items);
        };
        List.prototype.onBuy = function () {
            if (TheApplication.activeMarket == null)
                return true;
            TheApplication.activeMarket = null;
            this.refreshPage();
            return false;
        };
        List.prototype.loadFromStorage = function () {
            var storedItems = JSON.parse(localStorage[List.storageKey] || null) || [];
            this.items = $.map(storedItems, function (stored) { return new Item(stored); });
        };
        List.storageKey = 'JMSBuy.ItemList';
        List.pageName = '#itemList';
        return List;
    })(TheApplication.Master);
    _Item.List = List;
    var Details = (function (_super) {
        __extends(Details, _super);
        function Details(list) {
            var _this = this;
            _super.call(this, Details.pageName, '#updateItem', '#deleteItem', list);
            this.description = this.form.find('#itemDescription');
            this.market = this.form.find('#itemMarket');
            this.name = this.form.find('#itemName');
            this.name.on('change input', function () { return _this.onValidate(); });
        }
        Details.prototype.getName = function () {
            return (this.name.val() || '').trim();
        };
        Details.prototype.getDescription = function () {
            return (this.description.val() || '').trim();
        };
        Details.prototype.getMarket = function () {
            return this.market.val();
        };
        Details.prototype.saveChanges = function () {
            var name = this.getName();
            var market = this.getMarket();
            var description = this.getDescription();
            var item = TheApplication.itemScope;
            if (item == null)
                this.master.items.push(new Item({
                    state: 0 /* NewlyCreated */,
                    created: new Date($.now()),
                    description: description,
                    market: market,
                    bought: null,
                    priority: 0,
                    name: name,
                    id: null,
                }));
            else {
                item.name = name;
                item.market = market;
                item.description = description;
                if (item.state == 3 /* Unchanged */)
                    item.state = 2 /* Modified */;
            }
        };
        Details.prototype.deleteItem = function () {
            TheApplication.itemScope.state = 1 /* Deleted */;
        };
        Details.prototype.onValidate = function () {
            var name = this.getName();
            if (name.length > 0)
                TheApplication.enable(this.save);
            else
                TheApplication.disable(this.save);
        };
        Details.prototype.initializeForm = function () {
            var _this = this;
            var item = TheApplication.itemScope;
            if (item == null) {
                this.header.text('Neues Produkt');
                this.save.text('Anlegen');
                this.delete.hide();
                this.name.val('');
                this.description.val('');
            }
            else {
                this.header.text(item.name);
                this.save.text('Ändern');
                this.delete.show();
                this.name.val(item.name);
                this.description.val(item.description);
            }
            this.market.empty();
            var anyOption = $('<option />', { value: '', text: '(egal)' });
            var selectedOption = anyOption;
            this.market.append($('<option />'), anyOption);
            $.each(TheApplication.getMarkets().markets, function (index, market) {
                var marketOption = $('<option />', { text: market.name });
                if (item != null)
                    if (market.name == item.market)
                        selectedOption = marketOption;
                _this.market.append(marketOption);
            });
            selectedOption.attr('selected', 'selected');
            this.market.selectmenu('refresh');
            this.onValidate();
        };
        Details.pageName = '#itemDetails';
        return Details;
    })(TheApplication.Detail);
    _Item.Details = Details;
})(Item || (Item = {}));
//# sourceMappingURL=item.js.map