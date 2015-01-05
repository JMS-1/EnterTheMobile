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
    function getObjectFromResponse(responseString) {
        var jsonStart = responseString.indexOf('{');
        var jsonEnd = responseString.lastIndexOf('}');
        if ((jsonStart < 0) || (jsonEnd < jsonStart))
            return null;
        return JSON.parse(responseString.substr(jsonStart, jsonEnd + 1 - jsonStart));
    }
    TheApplication.getObjectFromResponse = getObjectFromResponse;
})(TheApplication || (TheApplication = {}));
//# sourceMappingURL=app.js.map