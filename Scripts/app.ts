
/*
    Repräsentiert die Anwendung als Ganzes und stellen insbesondere seitenübergreifende 
    Variablen zur Verfügung.
*/
module TheApplication {
    var classDisabled = 'ui-disabled';

    // Der aktuelle Zustand der Anwendung
    export var activeMarket: Market.IMarket = null; // Während des Einkaufs der Markt
    export var marketScope: Market.IMarket = null; // Der Markt, der im Detailformular angezeigt wird
    export var itemScope: Item.IItem = null; // Das Produkt, das im Detailformular angezeigt wird

    $(() => {
        // Produktverwaltung starten
        var itemList = new Item.List();
        var itemDetails = new Item.Details(itemList);

        // Marktverwaltung starten
        var marketSelectionList = new Market.List();
        var marketDetails = new Market.Details(marketSelectionList);

        // Anbindung an die Offline Verwaltung
        window.applicationCache.addEventListener('updateready', () => {
            if (window.applicationCache.status == ApplicationCache.UPDATEREADY)
                window.location.reload();
        });
    });

    // Deaktiviert Eingabelemente, Schaltflächen und Verweise.
    export function disable(nodes: JQuery): void {
        nodes.addClass(classDisabled);
    }

    // Aktiviert Eingabelemente, Schaltflächen und Verweise.
    export function enable(nodes: JQuery): void {
        nodes.removeClass(classDisabled);
    }

    // Macht aus einer Zahl eine zweistellige Zeichenkette.
    function formatNumberForDateTime(n: number): string {
        var s = n.toString();

        return (s.length == 2) ? s : ('0' + s);
    }

    // Wandelt ein Datum mit Uhrzeit in eine Kurzfassung für die Anzeige.
    export function formatDateTime(dateTime: Date): string {
        var month = dateTime.getMonth() + 1;
        var minute = dateTime.getMinutes();
        var hour = dateTime.getHours();
        var day = dateTime.getDate();

        return formatNumberForDateTime(day) + '.' + formatNumberForDateTime(month) + '. ' + formatNumberForDateTime(hour) + ':' + formatNumberForDateTime(minute);
    }
}