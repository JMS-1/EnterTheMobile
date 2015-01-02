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
            this.action = this.list.find('#goShopping');
            list.on('pagebeforeshow', function () { return _this.onShow(); });
            this.action.on('click', function () { return _this.onBuy(); });
            this.onShow();
        }
        // Action on the BUY button
        HomePage.prototype.onBuy = function () {
            // If no market is selected it's time to select it now
            if (currentMarket == null)
                return true;
            // Done with market
            currentMarket = null;
            // Refresh the UI
            this.onShow();
            // And stay where we are
            return false;
        };
        // Adapt UI to current operation mode
        HomePage.prototype.onShow = function () {
            var headerText = this.list.find('[data-role=header] h1');
            var market = currentMarket;
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
        return HomePage;
    })();
    // The market selection list page
    var MarketSelectionList = (function () {
        function MarketSelectionList(list) {
            var _this = this;
            this.list = list;
            list.on('pagecreate', function () { return _this.onCreated(); });
            list.on('pagebeforeshow', function () { return _this.onShow(); });
        }
        // Update the list
        MarketSelectionList.prototype.onShow = function () {
            var _this = this;
            // Reset current list view
            this.items.empty();
            // Reestablish list
            $.each(this.markets, function (i, market) { return market.appendTo(_this.items); });
            // Make sure list is mobile enhanced
            this.items.listview('refresh');
        };
        // Update local storage and (!) display
        MarketSelectionList.prototype.save = function () {
            // Make sure list is always ordered
            this.markets.sort(Market.compare);
            // Convert to storage format
            localStorage[MarketSelectionList.storageKey] = JSON.stringify(this.markets);
        };
        // Call once when the page is created
        MarketSelectionList.prototype.onCreated = function () {
            // Recover market list from local storage
            var storedMarkets = JSON.parse(localStorage[MarketSelectionList.storageKey] || null) || [];
            // Create production classes from pure serialisation
            this.markets = $.map(storedMarkets, function (stored) { return new Market(stored); });
            // Locate item list
            this.items = this.list.find('[data-role=listview]');
            // Process as change
            this.save();
            // Configure actions
            this.list.find('#newMarket').on('click', function () { return Market.detailsScope = null; });
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