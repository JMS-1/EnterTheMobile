var TheApplication;
(function (TheApplication) {
    // Global constants
    TheApplication.classDisabled = 'ui-disabled';
    TheApplication.homeName = '#homePage';
    // Global context
    TheApplication.currentMarket = null;
    TheApplication.currentDetail = null;
    // Synchronized startup code
    $(function () {
        var homePage = new HomePage($(TheApplication.homeName));
        // Market management
        var marketSelectionList = new Market.List();
        var marketDetails = new Market.Details(marketSelectionList);
    });
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
        HomePage.prototype.onShow = function () {
            var headerText = this.list.find('[data-role=header] h1');
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
        return HomePage;
    })();
})(TheApplication || (TheApplication = {}));
//# sourceMappingURL=app.js.map