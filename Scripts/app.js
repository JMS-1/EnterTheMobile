var TheApplication;
(function (TheApplication) {
    var classDisabled = 'ui-disabled';
    TheApplication.activeMarket = null;
    TheApplication.marketScope = null;
    TheApplication.itemScope = null;
    $(function () {
        var itemList = new Item.List();
        var itemDetails = new Item.Details(itemList);
        var marketSelectionList = new Market.List();
        var marketDetails = new Market.Details(marketSelectionList);
        window.applicationCache.addEventListener('updateready', function () {
            if (window.applicationCache.status == ApplicationCache.UPDATEREADY)
                window.location.reload();
        });
    });
    function disable(nodes) {
        nodes.addClass(classDisabled);
    }
    TheApplication.disable = disable;
    function enable(nodes) {
        nodes.removeClass(classDisabled);
    }
    TheApplication.enable = enable;
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