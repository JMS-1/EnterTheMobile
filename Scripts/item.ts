
module Item {
    export enum ItemState {
        NewlyCreated,

        Deleted,

        Modified,

        Unchanged
    }

    export interface IStoredItem {
        id: number;

        state: ItemState;

        name: string;

        description: string;

        created: Date;

        bought: Date;

        market: string;
    }

    export interface IItem extends IStoredItem {
        appendTo(items: JQuery): void;
    }

    export class Item implements IItem {
        private static nextCount = 0;

        private seq: string;

        id: number;

        state: ItemState;

        name: string;

        description: string;

        created: Date;

        bought: Date;

        market: string;

        constructor(stored: IStoredItem) {
            this.seq = 'itm' + (++Item.nextCount);

            this.id = stored.id;
            this.name = stored.name;
            this.state = stored.state;
            this.bought = stored.bought;
            this.market = stored.market;
            this.created = stored.created;
            this.description = stored.description;

            if (typeof (this.created) == 'string')
                this.created = new Date(<string><any>(this.created));
            if (typeof (this.bought) == 'string')
                this.bought = new Date(<string><any>(this.bought));
        }

        appendTo(items: JQuery): void {
            var checker = $('<input/>', { type: 'checkbox', name: this.seq, id: this.seq });
            var label = $('<label/>', { text: this.name, 'for': this.seq });

            checker.on('change', ev => this.onClick(ev));

            items.append(checker, label);
        }

        private onClick(ev: JQueryEventObject): void {
            if (TheApplication.activeMarket == null) {
                TheApplication.itemScope = this;

                $.mobile.changePage(Details.pageName, { transition: 'none' });
            }
        }
    }

    // The home page of it all
    export class List {
        private static storageKey = 'ItemList';

        static pageName = '#itemList';

        private action: JQuery;

        private page: JQuery;

        private list: JQuery;

        private items: IItem[];

        constructor() {
            this.page = $(List.pageName);
            this.action = this.page.find('#goShopping');
            this.list = this.page.find('[data-role=controlgroup]');

            this.page.on('pagebeforeshow', () => this.onShow());
            this.action.on('click', () => this.onBuy());

            var storedItems: IStoredItem[] = JSON.parse(localStorage[List.storageKey] || null) || [];

            this.items = $.map(storedItems, stored => new Item(stored));

            this.onShow();
        }

        private loadList(): void {
            this.list.empty();

            $.each(this.items, (i, item) => item.appendTo(this.list));

            this.list.trigger('create');
        }

        private save(): void {
            localStorage[List.storageKey] = JSON.stringify(this.items);
        }

        // Action on the BUY button
        private onBuy(): boolean {
            // If no market is selected it's time to select it now
            if (TheApplication.activeMarket == null)
                return true;

            // Done with market
            TheApplication.activeMarket = null;

            // Refresh the UI
            this.onShow();

            // And stay where we are
            return false;
        }

        // Adapt UI to current operation mode
        private onShow(): void {
            this.loadList();

            var headerText = this.page.find('[data-role=header] h1');
            var checkboxes = this.list.find('[type=checkbox]');
            var market = TheApplication.activeMarket;

            if (market == null) {
                // If no market is selected we are in collection mode
                headerText.text('Deine Einkaufsliste');

                this.action.text('Einkaufen');
            }
            else {
                // After a market is selected we are in buy mode
                headerText.text('Einkaufen bei ' + market.name);

                this.action.text('Einkaufen beenden');
            }
        }
    }

    export class Details {
        static pageName = '#itemDetails';

        private form: JQuery;

        private name: JQuery;

        private description: JQuery;

        private created: JQuery;

        private bought: JQuery;

        private market: JQuery;

        private header: JQuery;

        constructor() {
            this.form = $(Details.pageName);

            this.header = this.form.find('[data-role=header] h1');
            this.description = this.form.find('#itemDescription');
            this.bought = this.form.find('#itemBought');
            this.market = this.form.find('#itemMarket');
            this.created = this.form.find('#itemDate');
            this.name = this.form.find('#itemName');

            this.form.on('pagebeforeshow', () => this.onShow());
        }

        private onShow(): void {
            var item = TheApplication.itemScope;

            if (item == null) {
                this.header.text('Neues Produkt anlegen');

                this.name.val('');
                this.bought.val('');
                this.market.val('');
                this.description.val('');
                this.created.val(TheApplication.formatDateTime(new Date($.now())));
            }
            else {
                this.header.text(item.name);

                this.name.val(item.name);
                this.description.val(item.description);
                this.created.val(TheApplication.formatDateTime(item.created));

                if (item.bought == null) {
                    this.bought.val('');
                    this.market.val('');
                }
                else {
                    this.bought.val(TheApplication.formatDateTime(item.bought));
                    this.market.val(item.market);
                }
            }
        }
    }
}

