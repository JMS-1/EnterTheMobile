var TheApplication;
(function (TheApplication) {
    // Global constants
    TheApplication.classDisabled = 'ui-disabled';
    // Global context
    TheApplication.currentMarket = null;
    TheApplication.currentDetail = null;
    // Synchronized startup code
    $(function () {
        var homePage = new Item.List();
        // Market management
        var marketSelectionList = new Market.List();
        var marketDetails = new Market.Details(marketSelectionList);
    });
})(TheApplication || (TheApplication = {}));
//# sourceMappingURL=app.js.map