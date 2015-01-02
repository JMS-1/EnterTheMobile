var TheApplication;
(function (TheApplication) {
    // Global constants
    TheApplication.classDisabled = 'ui-disabled';
    // Global context
    TheApplication.activeMarket = null;
    TheApplication.marketScope = null;
    TheApplication.itemScope = null;
    // Synchronized startup code
    $(function () {
        // Item management
        var itemList = new Item.List();
        var itemDetails = new Item.Details();
        // Market management
        var marketSelectionList = new Market.List();
        var marketDetails = new Market.Details(marketSelectionList);
    });
    function formatNumberForDateTime(n) {
        var s = n.toString();
        return (s.length == 2) ? s : ('0' + s);
    }
    function formatDateTime(dateTime) {
        var month = dateTime.getMonth() + 1;
        var minute = dateTime.getMinutes();
        var hour = dateTime.getHours();
        var day = dateTime.getDate();
        return formatNumberForDateTime(day) + '.' + formatNumberForDateTime(month) + '. ' + formatNumberForDateTime(hour) + ':' + formatNumberForDateTime(minute);
    }
    TheApplication.formatDateTime = formatDateTime;
})(TheApplication || (TheApplication = {}));
//# sourceMappingURL=app.js.map