
module TheApplication {
    // Global constants
    export var classDisabled = 'ui-disabled';

    // Global context
    export var currentMarket: Market.IMarket = null;
    export var currentDetail: Market.IMarket = null;

    // Synchronized startup code
    $(() => {
        var homePage = new Item.List();

        // Market management
        var marketSelectionList = new Market.List();
        var marketDetails = new Market.Details(marketSelectionList);
    });

}