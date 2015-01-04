
/*
  Alles zur Verwaltung der Märkte.
*/
module Market {
    // Die Struktur der Ablage eines Marktes.
    export interface IStoredMarket {
        // Der Name des Marktes
        name: string;
    }

    // Die interne Repräsentation eines Marktes.
    export interface IMarket extends IStoredMarket {
        // Erstellt einen Listeneintrag für einen Markt.
        appendTo(items: JQuery): void;
    }

    // Die Implementierung eines Marktes
    class Market implements IMarket {
        constructor(fromStore: IStoredMarket) {
            this.name = fromStore.name;
        }

        name: string;

        appendTo(items: JQuery): void {
            // Die Anzeige des Namens zu Auswahl
            var choose = $('<a/>', { text: this.name, href: Item.List.pageName });
            choose.on('click', () => TheApplication.activeMarket = this);

            // Die Schaltfläche zur Pflege der Daten
            var edit = $('<a/>', { href: Details.pageName });
            edit.on('click', () => TheApplication.marketScope = this);

            items.append($('<li/>').append(choose, edit));
        }

        // Vergleicht die Namen zweier Märkte.
        static compare(left: IStoredMarket, right: IStoredMarket): number {
            return Market.compareNames(left.name, right.name);
        }

        // Vergleicht die Namen zweier Märkte.
        static compareNames(left: string, right: string): number {
            return left.localeCompare(right, undefined, { sensitivity: 'base' });
        }
    }

    // Die Auswahlliste der Märkte.
    export class List {
        // Unter diesem Namen wir die Marktliste in der lokalen Ablage gespeichert
        private static storageKey = 'JMSBuy.MarketList';

        // Der Name der Marktliste im DOM
        private static pageName = '#marketList';

        // Die Liste der Märkte
        private list: JQuery;

        // Die Seite in der Oberfläche
        private page: JQuery;

        // Alle zurzeit bekannten Märkte
        markets: IMarket[];

        constructor() {
            this.page = $(List.pageName);

            this.page.on('pagecreate', () => this.onCreated());
            this.page.on('pagebeforeshow', () => this.onShow());
        }

        // Aktualisiert die Liste der Märkte
        private onShow(): void {
            this.list.empty();

            // Die Anzeige wird neu aufgebaut
            $.each(this.markets, (i, market) => market.appendTo(this.list));

            // Und schließlich die Styles aktualisiert
            this.list.listview('refresh');
        }

        // Aktualisiert die lokale Ablage.
        save(): void {
            // Die Speicherung erfolgt grundsätzlich alphabetisch sortiert
            this.markets.sort(Market.compare);

            localStorage[List.storageKey] = JSON.stringify(this.markets);
        }

        // Wird einmalig beim Erzeugen der Seite aufgerufen.
        private onCreated(): void {
            this.list = this.page.find('[data-role=listview]');

            // Lokale Ablage auslesen
            var storedMarkets: IStoredMarket[] = JSON.parse(localStorage[List.storageKey] || null) || [];

            // Rohdaten aus der Ablage in nützliche Objekte wandeln
            this.markets = $.map(storedMarkets, stored => new Market(stored));

            // Sortieren und zurückspeichern - nur zur Sicherheit
            this.save();

            this.page.find('#newMarket').on('click', () => TheApplication.marketScope = null);
        }
    }

    // Das Formular zur Pflege der Daten eines Marktes.
    export class Details {
        // Der Name des Formulars im DOM
        static pageName = '#marketDetail';

        // Die Schaltfläche zur Aktualisierung der Eingaben
        private save: JQuery;

        // Die Schaltfläche zum Löschen eine Marktes
        private delete: JQuery;

        // Die Kopfzeile im DOM
        private header: JQuery;

        // Das Eingabeelement für den Namen
        private input: JQuery;

        // Das Formular als Ganzes
        private form: JQuery;

        constructor(private list: List) {
            this.form = $(Details.pageName);

            this.form.on('pagebeforeshow', () => this.onShow());
            this.form.on('pageshow', () => this.input.focus());

            this.input = this.form.find('#marketText');
            this.save = this.form.find('#updateMarket');
            this.delete = this.form.find('#deleteMarket');
            this.header = this.form.find('[data-role=header] h1');

            this.save.on('click', () => this.onSave());
            this.delete.on('click', () => this.onDelete());
            this.input.on('change input', () => this.onValidate());
        }

        // Ermittelt den aktuellen Namen des Marktes.
        private getName(): string {
            return (this.input.val() || '').trim();
        }

        // Eine Konsistenzprüfung für den Namen.
        private onValidate(): void {
            var valid = true;
            var name = this.getName();

            if (name.length < 1)
                // Der Name darf nicht leer sein
                valid = false;
            else
                // Und muss eindeutig sein
                $.each(this.list.markets, (i, market) => {
                    // Keine Übereinstimmung
                    if (Market.compareNames(name, market.name) != 0)
                        return true;

                    // Das sind wir selbst
                    if (market === TheApplication.marketScope)
                        return true;

                    // Ups, da haben wir eine Duplette gefunden
                    valid = false;
                    return false;
                });

            // Speichern ist nur bei einem gültigen Namen möglich
            if (valid)
                TheApplication.enable(this.save);
            else
                TheApplication.disable(this.save);
        }

        // Speichert den Markt.
        private onSave(): void {
            var name = this.getName();

            if (TheApplication.marketScope == null)
                // Ein neuer Markt wird angelegt
                this.list.markets.push(new Market({ name: name }));
            else
                // Ein existierender Markt wird verändert
                TheApplication.marketScope.name = name;

            // Die lokale Ablage wird immer unmittelbar aktualisiert
            this.list.save();
        }

        // Entfernt den gerade bearbeiteten Markt.
        private onDelete(): void {
            var index = this.list.markets.indexOf(TheApplication.marketScope);

            this.list.markets.splice(index, 1);
            this.list.save();
        }

        // Zeigt das Formular an.
        private onShow(): void {
            if (TheApplication.marketScope == null) {
                // Ein leeres Formular
                this.header.text('Neuen Markt anlegen');
                this.save.text('Anlegen');
                this.delete.hide();

                this.input.val('');
            }
            else {
                // Ein Formular mit den Daten eines existierenden Marktes
                this.header.text('Marktdaten verändern');
                this.save.text('Ändern');
                this.delete.show();

                this.input.val(TheApplication.marketScope.name);
            }

            // In jedem Fall prüfen wir einmal - beim Neuanlegen wird nun die Schaltfläche zum Speichern deaktiviert
            this.onValidate();
        }
    }
}

