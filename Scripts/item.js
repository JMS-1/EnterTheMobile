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
        }
        Item.prototype.appendTo = function (items) {
            var _this = this;
            var checker = $('<input/>', { type: 'checkbox', name: this.seq, id: this.seq });
            var label = $('<label/>', { text: this.name, 'for': this.seq });
            checker.on('change', function (ev) { return _this.onClick(ev); });
            items.append(checker, label);
        };
        Item.prototype.onClick = function (ev) {
            if (TheApplication.currentMarket == null) {
                $.mobile.changePage('#itemDetails', { transition: 'none' });
            }
        };
        Item.nextCount = 0;
        return Item;
    })();
    _Item.Item = Item;
    // The home page of it all
    var List = (function () {
        function List() {
            var _this = this;
            this.page = $(List.pageName);
            this.action = this.page.find('#goShopping');
            this.list = this.page.find('[data-role=controlgroup]');
            this.page.on('pagebeforeshow', function () { return _this.onShow(); });
            this.action.on('click', function () { return _this.onBuy(); });
            var storedItems = JSON.parse(localStorage[List.storageKey] || null) || [];
            this.items = $.map(storedItems, function (stored) { return new Item(stored); });
            this.onShow();
        }
        List.prototype.loadList = function () {
            var _this = this;
            this.list.empty();
            $.each(this.items, function (i, item) { return item.appendTo(_this.list); });
            this.list.trigger('create');
        };
        List.prototype.save = function () {
            localStorage[List.storageKey] = JSON.stringify(this.items);
        };
        // Action on the BUY button
        List.prototype.onBuy = function () {
            // If no market is selected it's time to select it now
            if (TheApplication.currentMarket == null)
                return true;
            // Done with market
            TheApplication.currentMarket = null;
            // Refresh the UI
            this.onShow();
            // And stay where we are
            return false;
        };
        // Adapt UI to current operation mode
        List.prototype.onShow = function () {
            this.loadList();
            var headerText = this.page.find('[data-role=header] h1');
            var checkboxes = this.list.find('[type=checkbox]');
            var market = TheApplication.currentMarket;
            if (market == null) {
                // If no market is selected we are in collection mode
                headerText.text('Deine Einkaufsliste');
                this.action.text('Einkaufen');
            }
            else {
                // After a market is selected we are in buy mode
                headerText.text('Einkaufen bei ' + market.name);
                this.action.text('Einkaufen beenden');
            }
        };
        List.storageKey = 'ItemList';
        List.pageName = '#itemList';
        return List;
    })();
    _Item.List = List;
})(Item || (Item = {}));
//# sourceMappingURL=item.js.map