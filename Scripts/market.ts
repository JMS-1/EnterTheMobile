
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
            var edit = $('<a/>', { href: MarketItem.pageName });
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
    export class List extends TheApplication.Master {
        // Unter diesem Namen wir die Marktliste in der lokalen Ablage gespeichert
        private static storageKey = 'JMSBuy.MarketList';

        // Alle zurzeit bekannten Märkte
        markets: IMarket[];

        constructor() {
            super('#marketList', '[data-role=listview]', '#newMarket');

            // Einmalig vorab laden
            this.loadFromStorage();
        }

        // Aktualisiert die Liste der Märkte
        protected refreshPage(): void {
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

        protected createNew(): void {
            TheApplication.marketScope = null;
        }

        // Wird einmalig beim Erzeugen der Seite aufgerufen.
        protected loadFromStorage(): void {
            // Lokale Ablage auslesen
            var storedMarkets: IStoredMarket[] = JSON.parse(localStorage[List.storageKey] || null) || [];

            // Rohdaten aus der Ablage in nützliche Objekte wandeln
            this.markets = $.map(storedMarkets, stored => new Market(stored));

            // Sortieren und zurückspeichern - nur zur Sicherheit
            this.save();
        }
    }

    // Das Formular zur Pflege der Daten eines Marktes.
    export class MarketItem extends TheApplication.Detail<List> {
        // Der Name des Formulars im DOM
        static pageName: string = '#marketDetail';

        // Das Eingabeelement für den Namen
        private input: JQuery;

        constructor(list: List) {
            super(MarketItem.pageName, '#updateMarket', '#deleteMarket', list);

            this.input = this.form.find('#marketText');
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
                $.each(this.master.markets, (i, market) => {
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
        protected saveChanges(): void {
            var name = this.getName();

            if (TheApplication.marketScope == null)
                // Ein neuer Markt wird angelegt
                this.master.markets.push(new Market({ name: name }));
            else
                // Ein existierender Markt wird verändert
                TheApplication.marketScope.name = name;
        }

        // Entfernt den gerade bearbeiteten Markt.
        protected deleteItem(): void {
            var index = this.master.markets.indexOf(TheApplication.marketScope);

            this.master.markets.splice(index, 1);
        }

        // Zeigt das Formular an.
        protected initializeForm(): void {
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

