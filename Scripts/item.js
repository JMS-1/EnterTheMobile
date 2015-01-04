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
            this.seq = 'itm' + (++Item.nextCount);
            this.id = stored.id;
            this.name = stored.name;
            this.state = stored.state;
            this.bought = stored.bought;
            this.market = stored.market;
            this.created = stored.created;
            this.description = stored.description;
            if (typeof (this.created) == 'string')
                this.created = new Date((this.created));
            if (typeof (this.bought) == 'string')
                this.bought = new Date((this.bought));
        }
        Item.prototype.appendTo = function (items, list) {
            var _this = this;
            if (this.state == 1 /* Deleted */)
                return;
            this.checker = $('<input/>', { type: 'checkbox', name: this.seq, id: this.seq });
            this.checker.prop('checked', this.market != null);
            this.checker.on('change', function (ev) { return _this.onClick(ev, list); });
            var label = $('<label/>', { text: this.name, title: this.description, 'for': this.seq });
            items.append(this.checker, label);
        };
        Item.prototype.onClick = function (ev, list) {
            if (TheApplication.activeMarket == null) {
                TheApplication.itemScope = this;
                $.mobile.changePage(Details.pageName, { transition: 'none' });
            }
            else {
                if (this.checker.is(':checked')) {
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
    var List = (function () {
        function List() {
            var _this = this;
            this.page = $(List.pageName);
            this.shopping = this.page.find('#goShopping');
            this.list = this.page.find('[data-role=controlgroup]');
            this.filter = this.page.find('#filter');
            this.sync = this.page.find('#syncItems');
            this.header = this.page.find('[data-role=header] h1');
            this.dialog = $('#register');
            this.userId = this.dialog.find('input');
            this.register = this.dialog.find('a');
            this.page.find('#newItem').on('click', function () { return TheApplication.itemScope = null; });
            this.page.on('pagebeforeshow', function () { return _this.onShow(); });
            this.filter.on('change', function () { return _this.loadList(); });
            this.shopping.on('click', function () { return _this.onBuy(); });
            this.sync.on('click', function () { return _this.synchronize(); });
            this.dialog.popup();
            this.register.on('click', function () { return _this.tryRegister(); });
            var storedItems = JSON.parse(localStorage[List.storageKey] || null) || [];
            this.items = $.map(storedItems, function (stored) { return new Item(stored); });
            this.onShow();
        }
        List.prototype.tryRegister = function () {
            var _this = this;
            TheApplication.disable(this.register);
            var userId = this.userId.val().trim();
            User.getUser(userId).done(function (userNameInfo) {
                _this.dialog.popup('close');
                if (typeof (userNameInfo) != 'object') {
                    TheApplication.disable(_this.sync);
                }
                else {
                    User.setUserId(userId, userNameInfo.name);
                    _this.onSynchronize();
                }
            });
        };
        List.prototype.synchronize = function () {
            if (User.getUserId().length < 1) {
                TheApplication.enable(this.register);
                this.dialog.popup('open');
            }
            else {
                this.onSynchronize();
            }
        };
        List.prototype.onSynchronize = function () {
            var _this = this;
            TheApplication.disable(this.sync);
            this.updateDatabase().done(function (itemList) {
                if (typeof (itemList) != 'object')
                    return;
                _this.items = $.map(itemList.items, function (stored) { return new Item(stored); });
                _this.save();
                TheApplication.enable(_this.sync);
                _this.loadList();
            });
        };
        List.prototype.updateDatabase = function () {
            var items = this.items.filter(function (item) { return item.state != 3 /* Unchanged */; });
            return $.ajax({
                data: JSON.stringify({ userid: User.getUserId(), items: items }),
                contentType: 'application/json',
                url: 'sync.php',
                type: 'POST',
            });
        };
        List.prototype.loadList = function () {
            var _this = this;
            this.list.empty();
            var all = (this.filter.val() == 1);
            $.each(this.items, function (i, item) {
                if (all || (item.market == null))
                    item.appendTo(_this.list, _this);
            });
            this.list.trigger('create');
        };
        List.prototype.save = function () {
            localStorage[List.storageKey] = JSON.stringify(this.items);
        };
        List.prototype.onBuy = function () {
            if (TheApplication.activeMarket == null)
                return true;
            TheApplication.activeMarket = null;
            this.onShow();
            return false;
        };
        List.prototype.onShow = function () {
            this.loadList();
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
        List.storageKey = 'JMSBuy.ItemList';
        List.pageName = '#itemList';
        return List;
    })();
    _Item.List = List;
    var Details = (function () {
        function Details(list) {
            var _this = this;
            this.list = list;
            this.form = $(Details.pageName);
            this.header = this.form.find('[data-role=header] h1');
            this.description = this.form.find('#itemDescription');
            this.delete = this.form.find('#deleteItem');
            this.bought = this.form.find('#itemBought');
            this.market = this.form.find('#itemMarket');
            this.created = this.form.find('#itemDate');
            this.save = this.form.find('#updateItem');
            this.name = this.form.find('#itemName');
            this.form.on('pagebeforeshow', function () { return _this.onShow(); });
            this.form.on('pageshow', function () { return _this.name.focus(); });
            this.save.on('click', function () { return _this.onSave(); });
            this.delete.on('click', function () { return _this.onDelete(); });
            this.name.on('change input', function () { return _this.onValidate(); });
        }
        Details.prototype.getName = function () {
            return (this.name.val() || '').trim();
        };
        Details.prototype.getDescription = function () {
            return (this.description.val() || '').trim();
        };
        Details.prototype.onSave = function () {
            var name = this.getName();
            var description = this.getDescription();
            var item = TheApplication.itemScope;
            if (item == null)
                this.list.items.push(new Item({
                    state: 0 /* NewlyCreated */,
                    created: new Date($.now()),
                    description: description,
                    bought: null,
                    market: null,
                    name: name,
                    id: null,
                }));
            else {
                item.name = name;
                item.description = description;
                if (item.state == 3 /* Unchanged */)
                    item.state = 2 /* Modified */;
            }
            this.list.save();
        };
        Details.prototype.onDelete = function () {
            TheApplication.itemScope.state = 1 /* Deleted */;
            this.list.save();
        };
        Details.prototype.onValidate = function () {
            var name = this.getName();
            if (name.length > 0)
                TheApplication.enable(this.save);
            else
                TheApplication.disable(this.save);
        };
        Details.prototype.onShow = function () {
            var item = TheApplication.itemScope;
            if (item == null) {
                this.header.text('Neues Produkt anlegen');
                this.save.text('Anlegen');
                this.delete.hide();
                this.name.val('');
                this.bought.val('');
                this.market.val('');
                this.created.val('');
                this.description.val('');
            }
            else {
                this.header.text(item.name);
                this.save.text('Ändern');
                this.delete.show();
                this.name.val(item.name);
                this.description.val(item.description);
                this.created.val(TheApplication.formatDateTime(item.created));
                if (item.bought == null) {
                    this.bought.val('');
                    this.market.val('');
                }
                else {
                    this.bought.val(TheApplication.formatDateTime(item.bought));
                    this.market.val(item.market);
                }
            }
        };
        Details.pageName = '#itemDetails';
        return Details;
    })();
    _Item.Details = Details;
})(Item || (Item = {}));
//# sourceMappingURL=item.js.map