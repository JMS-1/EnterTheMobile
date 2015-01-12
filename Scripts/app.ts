
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

    // Repräsentiert eine Liste.
    export class Master {
        // Die Liste im DOM
        protected list: JQuery;

        // Die Seite in der Oberfläche
        protected page: JQuery;

        constructor(pageName: string, listSelector: string, addName:string) {
            this.page = $(pageName);
            this.list = this.page.find(listSelector);

            this.page.find(addName).on('click', () => this.createNew());

            this.page.on('pagecreate', () => this.loadList());
            this.page.on('pagebeforeshow', () => this.fillList());
        }

        // Aktualisiert die Anzeige.
        protected fillList(): void {
            throw 'fillList is abstract';
        }

        // Aktualisiert die lokale Ablage.
        save(): void {
            throw 'save is abstract';
        }

        // Liest die lokale Ablage aus.
        protected loadList(): void {
            throw 'save is abstract';
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

        constructor(pageName: string, saveName: string, deleteName: string, protected list: TMaster) {
            this.form = $(pageName);

            this.form.on('pagebeforeshow', () => this.onPreShow());

            this.save = this.form.find(saveName);
            this.delete = this.form.find(deleteName);
            this.header = this.form.find('[data-role=header] h1');

            this.save.on('click', () => this.onSave());
            this.delete.on('click', () => this.onDelete());
        }

        // Methode zur Speicherung.
        protected prepareSave(): void {
            throw 'prepareSave is abstract';
        }

        // Speichert den Eintrag.
        private onSave(): void {
            this.prepareSave();
            this.list.save();
        }

        // Methode zum Löschen.
        protected prepareDelete(): void {
            throw 'prepareDelete is abstract';
        }

        // Löscht den Eintrag.
        private onDelete(): void {
            this.prepareDelete();
            this.list.save();
        }

        // Zeigt das Formular an.
        protected onPreShow(): void {
            throw 'onPreShow is abstract';
        }
    }
}