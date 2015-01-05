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
            var edit = $('<a/>', { href: Details.pageName });
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
    var List = (function () {
        function List() {
            var _this = this;
            this.page = $(List.pageName);
            this.page.on('pagecreate', function () { return _this.onCreated(); });
            this.page.on('pagebeforeshow', function () { return _this.onShow(); });
        }
        List.prototype.onShow = function () {
            var _this = this;
            this.list.empty();
            $.each(this.markets, function (i, market) { return market.appendTo(_this.list); });
            this.list.listview('refresh');
        };
        List.prototype.save = function () {
            this.markets.sort(Market.compare);
            localStorage[List.storageKey] = JSON.stringify(this.markets);
        };
        List.prototype.onCreated = function () {
            this.list = this.page.find('[data-role=listview]');
            var storedMarkets = JSON.parse(localStorage[List.storageKey] || null) || [];
            this.markets = $.map(storedMarkets, function (stored) { return new Market(stored); });
            this.save();
            this.page.find('#newMarket').on('click', function () { return TheApplication.marketScope = null; });
        };
        List.storageKey = 'JMSBuy.MarketList';
        List.pageName = '#marketList';
        return List;
    })();
    _Market.List = List;
    var Details = (function () {
        function Details(list) {
            var _this = this;
            this.list = list;
            this.form = $(Details.pageName);
            this.form.on('pagebeforeshow', function () { return _this.onShow(); });
            this.input = this.form.find('#marketText');
            this.save = this.form.find('#updateMarket');
            this.delete = this.form.find('#deleteMarket');
            this.header = this.form.find('[data-role=header] h1');
            this.save.on('click', function () { return _this.onSave(); });
            this.delete.on('click', function () { return _this.onDelete(); });
            this.input.on('change input', function () { return _this.onValidate(); });
        }
        Details.prototype.getName = function () {
            return (this.input.val() || '').trim();
        };
        Details.prototype.onValidate = function () {
            var valid = true;
            var name = this.getName();
            if (name.length < 1)
                valid = false;
            else
                $.each(this.list.markets, function (i, market) {
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
        Details.prototype.onSave = function () {
            var name = this.getName();
            if (TheApplication.marketScope == null)
                this.list.markets.push(new Market({ name: name }));
            else
                TheApplication.marketScope.name = name;
            this.list.save();
        };
        Details.prototype.onDelete = function () {
            var index = this.list.markets.indexOf(TheApplication.marketScope);
            this.list.markets.splice(index, 1);
            this.list.save();
        };
        Details.prototype.onShow = function () {
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
        Details.pageName = '#marketDetail';
        return Details;
    })();
    _Market.Details = Details;
})(Market || (Market = {}));
//# sourceMappingURL=market.js.map