
module TheApplication {
    // Global constants
    export var classDisabled = 'ui-disabled';

    // Global context
    export var activeMarket: Market.IMarket = null;
    export var marketScope: Market.IMarket = null;
    export var itemScope: Item.IItem = null;

    // Synchronized startup code
    $(() => {
        // Item management
        var itemList = new Item.List();
        var itemDetails = new Item.Details(itemList);

        // Market management
        var marketSelectionList = new Market.List();
        var marketDetails = new Market.Details(marketSelectionList);
    });

    function formatNumberForDateTime(n: number): string {
        var s = n.toString();

        return (s.length == 2) ? s : ('0' + s);
    }

    export function formatDateTime(dateTime: Date): string {
        var month = dateTime.getMonth() + 1;
        var minute = dateTime.getMinutes();
        var hour = dateTime.getHours();
        var day = dateTime.getDate();

        return formatNumberForDateTime(day) + '.' + formatNumberForDateTime(month) + '. ' + formatNumberForDateTime(hour) + ':' + formatNumberForDateTime(minute);
    }
}