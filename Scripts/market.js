var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Market;
(function (_Market) {
    var Market = (function () {
        function Market(fromStore) {
            this.name = fromStore.name;
        }
        Market.prototype.appendTo = function (items) {
            var _this = this;
            var choose = $('<a/>', { text: this.name, href: Item.List.pageName });
            choose.on('click', function () { return TheApplication.activeMarket = _this; });
            var edit = $('<a/>', { href: MarketItem.pageName });
            edit.on('click', function () { return TheApplication.marketScope = _this; });
            items.append($('<li/>').append(choose, edit));
        };
        Market.compare = function (left, right) {
            return Market.compareNames(left.name, right.name);
        };
        Market.compareNames = function (left, right) {
            return left.localeCompare(right, undefined, { sensitivity: 'base' });
        };
        return Market;
    })();
    var List = (function (_super) {
        __extends(List, _super);
        function List() {
            _super.call(this, '#marketList', '[data-role=listview]', '#newMarket');
            this.loadFromStorage();
        }
        List.prototype.refreshPage = function () {
            var _this = this;
            this.list.empty();
            $.each(this.markets, function (i, market) { return market.appendTo(_this.list); });
            this.list.listview('refresh');
        };
        List.prototype.save = function () {
            this.markets.sort(Market.compare);
            localStorage[List.storageKey] = JSON.stringify(this.markets);
        };
        List.prototype.createNew = function () {
            TheApplication.marketScope = null;
        };
        List.prototype.loadFromStorage = function () {
            var storedMarkets = JSON.parse(localStorage[List.storageKey] || null) || [];
            this.markets = $.map(storedMarkets, function (stored) { return new Market(stored); });
            this.save();
        };
        List.storageKey = 'JMSBuy.MarketList';
        return List;
    })(TheApplication.Master);
    _Market.List = List;
    var MarketItem = (function (_super) {
        __extends(MarketItem, _super);
        function MarketItem(list) {
            var _this = this;
            _super.call(this, MarketItem.pageName, '#updateMarket', '#deleteMarket', list);
            this.input = this.form.find('#marketText');
            this.input.on('change input', function () { return _this.onValidate(); });
        }
        MarketItem.prototype.getName = function () {
            return (this.input.val() || '').trim();
        };
        MarketItem.prototype.onValidate = function () {
            var valid = true;
            var name = this.getName();
            if (name.length < 1)
                valid = false;
            else
                $.each(this.master.markets, function (i, market) {
                    if (Market.compareNames(name, market.name) != 0)
                        return true;
                    if (market === TheApplication.marketScope)
                        return true;
                    valid = false;
                    return false;
                });
            if (valid)
                TheApplication.enable(this.save);
            else
                TheApplication.disable(this.save);
        };
        MarketItem.prototype.saveChanges = function () {
            var name = this.getName();
            if (TheApplication.marketScope == null)
                this.master.markets.push(new Market({ name: name }));
            else
                TheApplication.marketScope.name = name;
        };
        MarketItem.prototype.deleteItem = function () {
            var index = this.master.markets.indexOf(TheApplication.marketScope);
            this.master.markets.splice(index, 1);
        };
        MarketItem.prototype.initializeForm = function () {
            if (TheApplication.marketScope == null) {
                this.header.text('Neuen Markt anlegen');
                this.save.text('Anlegen');
                this.delete.hide();
                this.input.val('');
            }
            else {
                this.header.text('Marktdaten verändern');
                this.save.text('Ändern');
                this.delete.show();
                this.input.val(TheApplication.marketScope.name);
            }
            this.onValidate();
        };
        MarketItem.pageName = '#marketDetail';
        return MarketItem;
    })(TheApplication.Detail);
    _Market.MarketItem = MarketItem;
})(Market || (Market = {}));
//# sourceMappingURL=market.js.map