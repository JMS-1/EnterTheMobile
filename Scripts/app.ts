
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
        $.mobile.hashListeningEnabled = false;

        // Produktverwaltung starten
        var itemList = new Item.List();
        var itemDetails = new Item.Details(itemList);

        // Marktverwaltung starten
        var marketSelectionList = new Market.MarketList();
        var marketDetails = new Market.MarketItem(marketSelectionList);

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

    // Repräsentiert eine Liste.
    export class Master {
        // Die Liste im DOM
        protected list: JQuery;

        // Die Seite in der Oberfläche
        protected page: JQuery;

        constructor(pageSelector: string, listSelector: string, newSelector: string) {
            this.page = $(pageSelector);
            this.list = this.page.find(listSelector);

            this.page.find(newSelector).on('click', () => this.createNew());

            this.page.on('pagecreate', () => this.loadFromStorage());
            this.page.on('pagebeforeshow', () => this.refreshPage());
        }

        // Aktualisiert die Anzeige.
        protected refreshPage(): void {
            throw 'refreshPage is abstract';
        }

        // Aktualisiert die lokale Ablage.
        save(): void {
            throw 'save is abstract';
        }

        // Liest die lokale Ablage aus.
        protected loadFromStorage(): void {
            throw 'loadFromStorage is abstract';
        }

        // Erstellt einen neuen Eintrag.
        protected createNew(): void {
            throw 'createNew is abstract';
        }
    }

    // Ein Formular zur Pflege eines Listeneintrags.
    export class Detail<TMaster extends Master> {
        // Die Schaltfläche zur Aktualisierung der Eingaben
        protected save: JQuery;

        // Die Schaltfläche zum Löschen
        protected delete: JQuery;

        // Die Kopfzeile im DOM
        protected header: JQuery;

        // Das Formular als Ganzes
        protected form: JQuery;

        constructor(pageSelector: string, saveSelector: string, deleteSelector: string, protected master: TMaster) {
            this.form = $(pageSelector);
            this.form.on('pagebeforeshow', () => this.initializeForm());

            this.save = this.form.find(saveSelector);
            this.save.on('click', () => this.onSave());

            this.delete = this.form.find(deleteSelector);
            this.delete.on('click', () => this.onDelete());

            this.header = this.form.find('[data-role=header] h1');
        }

        // Methode zur Speicherung.
        protected saveChanges(): void {
            throw 'saveChanges is abstract';
        }

        // Speichert den Eintrag.
        private onSave(): void {
            this.saveChanges();
            this.master.save();
        }

        // Methode zum Löschen.
        protected deleteItem(): void {
            throw 'deleteItem is abstract';
        }

        // Löscht den Eintrag.
        private onDelete(): void {
            this.deleteItem();
            this.master.save();
        }

        // Zeigt das Formular an.
        protected initializeForm(): void {
            throw 'initializeForm is abstract';
        }
    }
}