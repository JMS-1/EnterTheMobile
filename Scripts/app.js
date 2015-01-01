var TheApplication;
(function (TheApplication) {
    var marketSelectionList;
    // Synchronized startup code
    $(function () {
        marketSelectionList = new MarketSelectionList($('#marketList'));
    });
    var Market = (function () {
        function Market() {
        }
        return Market;
    })();
    var MarketSelectionList = (function () {
        function MarketSelectionList(list) {
            var _this = this;
            this.list = list;
            list.on('pagecreate', function () { return _this.onCreated(); });
        }
        MarketSelectionList.prototype.add = function (market) {
            $('<li>', { text: market.name }).appendTo(this.items);
        };
        MarketSelectionList.prototype.load = function () {
            var _this = this;
            this.markets = JSON.parse(localStorage[MarketSelectionList.storageKey] || null) || [];
            this.markets.sort(function (l, r) { return l.name.localeCompare(r.name); });
            $.each(this.markets, function (i, market) { return _this.add(market); });
            this.items.listview('refresh');
        };
        MarketSelectionList.prototype.save = function () {
            localStorage[MarketSelectionList.storageKey] = JSON.stringify(this.markets);
        };
        MarketSelectionList.prototype.onCreated = function () {
            this.items = this.list.find('[data-role=listview]');
            this.load();
        };
        MarketSelectionList.storageKey = 'MarketList';
        return MarketSelectionList;
    })();
})(TheApplication || (TheApplication = {}));
//# sourceMappingURL=app.js.map