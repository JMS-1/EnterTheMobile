var Item;
(function (Item) {
    // The home page of it all
    var List = (function () {
        function List() {
            var _this = this;
            this.list = $(List.pageName);
            this.action = this.list.find('#goShopping');
            this.list.on('pagebeforeshow', function () { return _this.onShow(); });
            this.action.on('click', function () { return _this.onBuy(); });
            this.onShow();
        }
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
        List.pageName = '#itemList';
        return List;
    })();
    Item.List = List;
})(Item || (Item = {}));
//# sourceMappingURL=item.js.map