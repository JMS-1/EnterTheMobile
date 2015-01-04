
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

    // Rekonstruiert ein JSON Objekt aus einer Antwort des Web-Servers.
    export function getObjectFromResponse(responseString: string): any {
        // Im Fehlerfall lassen wir die Schaltfläche einfach deaktiviert
        var jsonStart = responseString.indexOf('{');
        var jsonEnd = responseString.lastIndexOf('}');
        if ((jsonStart < 0) || (jsonEnd != responseString.length - 1))
            return null;

        // Rekonstruieren
        return JSON.parse(responseString.substr(jsonStart));
    }
}