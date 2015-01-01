var TheApplication;
(function (TheApplication) {
    var homeName = '#homePage';
    var marketListName = '#marketList';
    var marketDetailsName = '#marketDetail';
    var marketSelectionList;
    var marketDetails;
    var homePage;
    // Set as soon as we start buying
    var currentMarket = null;
    // Synchronized startup code
    $(function () {
        marketSelectionList = new MarketSelectionList($(marketListName));
        marketDetails = new MarketDetails($(marketDetailsName));
        homePage = new HomePage($(homeName));
    });
    // Market effective data implementation
    var Market = (function () {
        function Market(fromStore) {
            this.name = fromStore.name;
        }
        Market.prototype.appendTo = function (items) {
            var _this = this;
            var choose = $('<a/>', { text: this.name, href: homeName });
            var edit = $('<a/>', { href: marketDetailsName });
            choose.on('click', function () { return currentMarket = _this; });
            edit.on('click', function () { return Market.detailsScope = _this; });
            items.append($('<li/>').append(choose).append(edit));
        };
        Market.compare = function (left, right) {
            return left.name.localeCompare(right.name);
        };
        return Market;
    })();
    // The home page of it all
    var HomePage = (function () {
        function HomePage(list) {
            var _this = this;
            this.list = list;
            list.on('pagebeforeshow', function () { return _this.onShow(); });
            this.onShow();
        }
        HomePage.prototype.onShow = function () {
            var headerText = this.list.find('[data-role=header] h1');
            var market = currentMarket;
            if (market == null)
                headerText.text('Deine Einkaufsliste');
            else
                headerText.text('Einkaufen bei ' + market.name);
        };
        return HomePage;
    })();
    // The market selection list page
    var MarketSelectionList = (function () {
        function MarketSelectionList(list) {
            var _this = this;
            this.list = list;
            list.on('pagecreate', function () { return _this.onCreated(); });
        }
        MarketSelectionList.prototype.load = function () {
            var _this = this;
            var storedMarkets = JSON.parse(localStorage[MarketSelectionList.storageKey] || null) || [];
            this.markets = $.map(storedMarkets, function (stored) { return new Market(stored); });
            this.markets.sort(Market.compare);
            $.each(this.markets, function (i, market) { return market.appendTo(_this.items); });
            this.items.listview('refresh');
        };
        MarketSelectionList.prototype.save = function () {
            localStorage[MarketSelectionList.storageKey] = JSON.stringify(this.markets);
        };
        MarketSelectionList.prototype.onCreated = function () {
            this.list.find('#newMarket').on('click', function () { return Market.detailsScope = null; });
            this.items = this.list.find('[data-role=listview]');
            this.load();
        };
        MarketSelectionList.storageKey = 'MarketList';
        return MarketSelectionList;
    })();
    // The market details page
    var MarketDetails = (function () {
        function MarketDetails(list) {
            var _this = this;
            this.list = list;
            list.on('pagebeforeshow', function () { return _this.onShow(); });
        }
        MarketDetails.prototype.onShow = function () {
            var headerText = this.list.find('[data-role=header] h1');
            var market = Market.detailsScope;
            if (market == null)
                headerText.text('Neuen Markt anlegen');
            else
                headerText.text('Marktdaten verändern');
        };
        return MarketDetails;
    })();
})(TheApplication || (TheApplication = {}));
//# sourceMappingURL=app.js.map