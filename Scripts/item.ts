﻿
/*
    Die Verwaltung der Produkte, die eingekauft werden sollen und der Vorgang des Einkaufs
    selbst. Auch die Synchronisation mit der Online Datenbank ist hier untergebracht.
*/
module Item {

    // Die einzelnen Zustände eines Produktes.
    export enum ItemState {
        // Das Produkt wurde Offline angelegt und noch nicht zur Datenbank übertragen.
        NewlyCreated,

        // Ein Produkt wurde Offline gelöscht, es kann aber eventuell noch in der Datenbank existieren.
        Deleted,

        // Ein Produkt aus der Datenbank wurde Offline verändert, die Änderung aber noch nicht wieder an die Datenbank übertragen.
        Modified,

        // Das Produkt entstammt der Datenbank.
        Unchanged
    }

    // Beschreibt die Persistenzsicht auf ein Produkt.
    export interface IStoredItem {
        // Optional die von der Datenbank vergebene eindeutige Nummer.
        id: number;

        // Der aktuelle Datenstand des Produktes.
        state: ItemState;

        // Der Name des Produktes.
        name: string;

        // Eine optionale Beschreibung des Produktes.
        description: string;

        // Der Zeitpunkt, an dem das Produkt angelegt wurde.
        created: Date;

        // Der Zeitpunkt, an dem das Produkt tatsächlich gekauft wurde.
        bought: Date;

        // Der Markt, in dem das Produkt erworben wurde.
        market: string;

        // Die Ordnung es Produktes.
        priority: number;
    }

    // Die Objektsicht auf ein Produkt.
    export interface IItem extends IStoredItem {
        // Erstellt einen Auswahleintrag des Produktes in der Liste aller Produkte.
        appendTo(items: JQuery, list: List): void;

        // Aktualisiert die Ordnung.
        setPriority(newPriority: number): void;
    }

    // Die konkete Implementierung eines Produktes.
    class Item implements IItem {
        // Hilfszähler zur eindeutigen Vergabe von Elementnamen im DOM.
        private static nextCount = 0;

        id: number;

        state: ItemState;

        name: string;

        description: string;

        created: Date;

        bought: Date;

        market: string;

        priority: number;

        constructor(stored: IStoredItem) {
            this.id = stored.id;
            this.name = stored.name;
            this.state = stored.state;
            this.bought = stored.bought;
            this.market = stored.market;
            this.created = stored.created;
            this.priority = stored.priority || 0;
            this.description = stored.description;

            // Datumswerte werden bei der Persistierung in ISO Zeichenketten gewandelt, intern arbeiten wir aber mit echten Datumsobjekten.
            if (typeof (this.created) == 'string')
                this.created = new Date(<string><any>(this.created));
            if (typeof (this.bought) == 'string')
                this.bought = new Date(<string><any>(this.bought));
        }

        setPriority(newPriority: number): boolean {
            if (newPriority == this.priority)
                return false;

            this.priority = newPriority;

            return true;
        }

        appendTo(items: JQuery, list: List): void {
            // Offline gelöschte Produkte werden nie angezeigt
            if (this.state == ItemState.Deleted)
                return;

            // Das Auswahlfeld
            var seq = 'itm' + (++Item.nextCount);
            var checker = $('<input/>', { type: 'checkbox', name: seq, id: seq });
            checker.prop('checked', this.bought != null);
            checker.on('change', ev => this.onClick(ev, list, checker));

            // Die Daten zum Produkt, so wie sie zur Auswahl angeboten werden
            var name = this.name;
            if ((this.market || '') != '')
                name = this.market + ': ' + name;

            var label = $('<label/>', { text: name, title: this.description, 'for': seq });

            label.on('swipeleft',() => list.moveItem(this, false));
            label.on('swiperight',() => list.moveItem(this, true));

            items.append(checker, label);
        }

        // Wird bei der Auswahl des Produktes aktiviert.
        private onClick(ev: JQueryEventObject, list: List, checker: JQuery): void {
            if (TheApplication.activeMarket == null) {
                // Sind wir gerade nicht beim Einkaufen, so können die Produktdaten verändert werden
                TheApplication.itemScope = this;

                $.mobile.pageContainer.pagecontainer("change", Details.pageName, { transition: 'none' });
            }
            else {
                // Während des Einkaufens wird die Marktzuordnung einfach verändert
                if (checker.is(':checked')) {
                    this.market = TheApplication.activeMarket.name;
                    this.bought = new Date($.now());
                }
                else {
                    this.market = null;
                    this.bought = null;
                }

                // Der Zustand muss angepasst werden, damit die Synchronisation mit der Datenbank korrekt durchgeführt werden kann
                if (this.state == ItemState.Unchanged)
                    this.state = ItemState.Modified;

                // Alle Änderungen werden immer ohne Verzögerung Offline gespeichert
                list.save();
            }
        }
    }

    // So sieht die Antwort bei der Synchronisation des Offline Produktbestandes mit der Datenbank aus
    interface ISynchronized {
        items: IStoredItem[];

        markets: Market.IStoredMarket[];
    }

    // Die Liste aller Produkte
    export class List extends TheApplication.Master {
        // Der Name der Produktliste in der lokalen Ablage
        private static storageKey = 'JMSBuy.ItemList';

        // Der Name der Seite im DOM.
        static pageName = '#itemList';

        // Die Schaltfläche zum Beginnen oder Beenden eines Einkaufs
        private shopping: JQuery;

        // Die Einschränkung der Anzeige der Listenelemente
        private filter: JQuery;

        // Die Schaltfläche für die Synchronisation mit der Datenbank
        private sync: JQuery;

        // Der Dialog zur einmaligen Anmeldung
        private dialog: JQuery;

        // Das Eingabefeld der Benutzerkennung bei der Anmeldung
        private userId: JQuery;

        // Die Schaltfläche zur Ausführung der Anmeldung
        private register: JQuery;

        // Die Überschrift der Seite
        private header: JQuery;

        // Der Dialog mit den Einstellungen
        private settings: JQuery;

        // Alle Produkte
        items: IItem[];

        constructor() {
            super(List.pageName, '#products', '#newItem');

            this.settings = $('#settings');

            this.header = this.page.find('[data-role=header] h1');
            this.shopping = this.page.find('#goShopping');
            this.filter = this.page.find('#showAll');
            this.sync = this.page.find('#syncItems');

            this.dialog = $('#register');
            this.userId = this.dialog.find('input');
            this.register = this.dialog.find('a');

            var someFilter = this.page.find('#showSome');
            var settings = this.page.find('#openSettings');
            var reregister = this.settings.find('#newRegister');

            this.filter.on('change',() => this.refreshPage());
            someFilter.on('change',() => this.refreshPage());

            this.shopping.on('click',() => this.onBuy());
            this.sync.on('click',() => this.synchronize());

            this.dialog.popup();
            this.settings.enhanceWithin().popup({ positionTo: settings.selector });
            this.register.on('click',() => this.tryRegister());
            settings.on('click',() => this.showSettings());

            reregister.on('click',() => this.reRegister());

            // Die Einstiegsseite erstmalig mit den Produkdaten füllen
            this.loadFromStorage();
            this.refreshPage();
        }

        // Erstellt einen neuen Eintrag.
        protected createNew(): void {
            TheApplication.itemScope = null;
        }

        // Zeigt die Einstellungen an.
        private showSettings(): void {
            if (this.userId.val() == '')
                this.userId.val(User.getUserId());

            this.settings.popup({ afterclose: null });
            this.settings.popup('open');
        }

        // Verschiebt einen Eintrag.
        moveItem(item: Item, forward: boolean): void {
            // Erst einmal müssen wir den Eintrag verifizieren
            var index = this.items.indexOf(item);
            if (index < 0)
                return;

            // Die neue Position
            var newIndex = index + (forward ? +1 : -1);
            if (newIndex < 0)
                return;
            if (newIndex >= this.items.length)
                return;

            // Austauschen
            this.items[index] = this.items[newIndex];
            this.items[newIndex] = item;

            // Speichern
            this.save();

            // Neu aufbauen
            this.refreshPage();
        }

        // Führt den einmaligen Anmeldevorgang aus
        private tryRegister(): void {
            // Kleines Feedback für den Anwender
            TheApplication.disable(this.register);

            // Das hat der Anwender eingegeben, auf eine Prüfung verzichten wird, dass soll gefälligst die Datenbank machen
            var userId = this.userId.val().trim();

            User.getUser(userId)
                .done(userNameInfo => {
                // Den Dialog schliessen wir immer
                this.dialog.popup('close');

                if (typeof (userNameInfo) == 'string') {
                    // Bei Fehlern stellen wir sicher, dass wir es nicht noch einmal probieren - erst nach dem nächsten Refresh der Anwendung
                    TheApplication.disable(this.sync);
                }
                else if (userNameInfo.name.length > 0) {
                    // Die Benutzerkennung wurde bestätigt
                    User.setUserId(userId, userNameInfo.name);

                    // Nun können wir die ursprünglich angeforderte Synchronisation mit der Datenbank anfordern
                    this.refreshPage();
                    this.onSynchronize();
                }
            });
        }

        // Zeigt den Anmeldedialog erneut an.
        private reRegister(): void {
            this.settings.popup({ afterclose: () => window.setTimeout(() => this.showRegistration(), 10) });
            this.settings.popup('close');
        }

        // Zeigt den Anmeldedialog an.
        private showRegistration(): void {
            // Beim ersten Mal muss der Benutzer sich mit seiner eindeutigen Kennung bei der Datenbank anmelden
            TheApplication.enable(this.register);
            this.dialog.popup('open');
        }

        // Fordert die Synchronisation mit der Datenbank an.
        private synchronize(): void {
            if (User.getUserId().length < 1) {
                // Beim ersten Mal muss der Benutzer sich mit seiner eindeutigen Kennung bei der Datenbank anmelden
                this.showRegistration();
            }
            else {
                // Ansosten kann man die Synchronisation direkt starten
                this.onSynchronize();
            }
        }

        // Startet die Synchronisation mit der Datenbank.
        private onSynchronize(): void {
            // Als Feedback wird die Schaltfläche erst einmal deaktiviert
            TheApplication.disable(this.sync);

            this.updateDatabase()
                .done(itemList => {
                // Im Fehlerfall lassen wir die Schaltfläche einfach deaktiviert
                if (typeof (itemList) == 'string')
                    return;

                // Die Informationen aus der Online Datenbank werden lokal übernommen
                this.items = $.map(itemList.items, stored => new Item(stored));
                this.save();

                // Auch die Märkte
                TheApplication.getMarkets().update(itemList.markets);

                // Es ist nun wieder möglich, eine weitere Synchronisation anzustossen
                TheApplication.enable(this.sync);

                // Die Produktliste muss entsprechend erneuert werden
                this.refreshPage();
            });
        }

        // Führt den Aufruf an die Datenbank aus.
        private updateDatabase(): JQueryPromise<ISynchronized> {
            // Schauen wir mal, ob eine Aktualisierung notwendig ist
            var mustUpdateItems = false;

            // Aktuelle Ordnung fixieren
            $.each(this.items,(index, item) => {
                // Eine Aktualisierung ist sicher notwendig, wenn sich die Ordnung oder die Daten zum Produkt verändert haben
                if (item.setPriority(index))
                    mustUpdateItems = true;
                else if (item.state != ItemState.Unchanged)
                    mustUpdateItems = true;
            });

            // Es werden immer alle Produkte übertragen
            var items = mustUpdateItems ? this.items : [];

            // Bei bei den Märkten aber nur die Veränderungen
            var markets = TheApplication.getMarkets().markets.filter(market => market.deleted || (market.name != market.originalName));

            return $.ajax({
                data: JSON.stringify({ userid: User.getUserId(), items: items, markets: markets }),
                contentType: 'application/json',
                url: 'sync.php',
                type: 'POST',
            });
        }

        // Erneuert die Anzeige der Produktliste.
        protected refreshPage(): void {
            this.list.empty();

            // Filterbedingung auswerten
            var all = this.filter.is(':checked');

            $.each(this.items,(i, item) => {
                if (all || (item.bought == null))
                    item.appendTo(this.list, this);
            });

            // Und schließlich die Styles aktualisiert
            this.list.trigger('create');

            var market = TheApplication.activeMarket;
            if (market == null) {
                var userName = User.getUserName();

                // Wir sind dabei, die Produkte zusammen zu stellen
                this.header.text((userName == '') ? 'Deine Einkaufsliste' : userName);
                this.shopping.text('Einkaufen');

                // Dann ist auch die Synchronisation mit der Datenbank erlaubt
                TheApplication.enable(this.sync);
            }
            else {
                // Wird kaufen gerade ein
                this.header.text('Einkaufen bei ' + market.name);
                this.shopping.text('Einkaufen beenden');

                // Eine Synchronisation mit der Datenbank kann unerwünschte Seiteneffekte haben und wird daher abgeschaltet
                TheApplication.disable(this.sync);
            }
        }

        // Überträgt alle Produkt in die lokale Ablage.
        save(): void {
            localStorage[List.storageKey] = JSON.stringify(this.items);
        }

        // Startet oder beendet einen Einkaufsvorgang.
        private onBuy(): boolean {
            // Wir gehen den normalen Weg zur Auswahl des Marktes
            if (TheApplication.activeMarket == null)
                return true;

            // Es war bereits ein Markt ausgewählt und der Einkaufsvorgang wird beendet
            TheApplication.activeMarket = null;

            // Die Anzeige müssen wir dementsprechend erneuern
            this.refreshPage();

            // Ansonsten bleibt die Anzeige auf der Produktliste stehen
            return false;
        }

        // Baut die Anzeige der Produktliste neu auf.
        protected loadFromStorage(): void {
            // Die persistierten Produktdaten aus der lokalen Ablage übernehmen
            var storedItems: IStoredItem[] = JSON.parse(localStorage[List.storageKey] || null) || [];

            // Zu den Rohdaten die benötigten konkreten Objekte erzeugen
            this.items = $.map(storedItems, stored => new Item(stored));
        }
    }

    // Das Formular zum Ändern der Produktdaten.
    export class Details extends TheApplication.Detail<List> {
        // Der Name des Formulars im DOM
        static pageName = '#itemDetails';

        // Das Eingabefeld für den Namen des Produktes
        private name: JQuery;

        // Das Eingabefeld für die Beschreibung des Produktes
        private description: JQuery;

        // Die Auswahlliste für den Markt
        private market: JQuery;

        constructor(list: List) {
            super(Details.pageName, '#updateItem', '#deleteItem', list);

            this.description = this.form.find('#itemDescription');
            this.market = this.form.find('#itemMarket');

            this.name = this.form.find('#itemName');
            this.name.on('change input',() => this.onValidate());
        }

        // Meldet den eingegebenen Namen.
        private getName(): string {
            return (this.name.val() || '').trim();
        }

        // Meldet die eingegebene Beschreibung.
        private getDescription(): string {
            return (this.description.val() || '').trim();
        }

        // Meldet den aktuell ausgewählten Markt.
        private getMarket(): string {
            return this.market.val();
        }

        // Speicher die Eingaben.
        protected saveChanges(): void {
            var name = this.getName();
            var market = this.getMarket();
            var description = this.getDescription();
            var item = TheApplication.itemScope;

            if (item == null)
                // Ein neues Produkt muss angelegt werden
                this.master.items.push(
                    new Item({
                        state: ItemState.NewlyCreated,
                        created: new Date($.now()),
                        description: description,
                        market: market,
                        bought: null,
                        priority: 0,
                        name: name,
                        id: null,
                    }));
            else {
                // Ein Produkt wird verändert - dabei dürfen wir den Zustand nicht vergessen
                item.name = name;
                item.market = market;
                item.description = description;

                if (item.state == ItemState.Unchanged)
                    item.state = ItemState.Modified;
            }
        }

        // Das Produkt wird gelöscht.
        protected deleteItem(): void {
            // Dazu müssen wir nur den Zustand anpassen - und die lokale Ablage auf den neuesten Stand bringen
            TheApplication.itemScope.state = ItemState.Deleted;
        }

        // Ein bisschen Prüfung muss her.
        private onValidate(): void {
            var name = this.getName();

            // Zum Speichern muss ein nicht leerer Name angegeben werden
            if (name.length > 0)
                TheApplication.enable(this.save);
            else
                TheApplication.disable(this.save);
        }

        // Bereitet die Anzeige für ein Produkt vor.
        protected initializeForm(): void {
            var item = TheApplication.itemScope;
            if (item == null) {
                // Ein ganz neues Produkt
                this.header.text('Neues Produkt');
                this.save.text('Anlegen');
                this.delete.hide();

                this.name.val('');
                this.description.val('');
            }
            else {
                // Ein existierendes Produkt
                this.header.text(item.name);
                this.save.text('Ändern');
                this.delete.show();

                this.name.val(item.name);
                this.description.val(item.description);
            }

            // Markt vorbereiten
            this.market.empty();

            var anyOption = $('<option />', { value: '', text: '(egal)' });
            var selectedOption = anyOption;

            this.market.append(anyOption);

            $.each(TheApplication.getMarkets().markets,(index, market) => {
                var marketOption = $('<option />', { text: market.name });
                if (item != null)
                    if (market.name == item.market)
                        selectedOption = marketOption;

                this.market.append(marketOption);
            });

            selectedOption.attr('selected', 'selected');

            this.market.selectmenu('refresh');

            // Immer einmal prüfen
            this.onValidate();
        }
    }
}

