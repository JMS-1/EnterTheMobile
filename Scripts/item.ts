
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

        private checker: JQuery;

        constructor(stored: IStoredItem, private list: List) {
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
            if (this.state == ItemState.Deleted)
                return;

            this.checker = $('<input/>', { type: 'checkbox', name: this.seq, id: this.seq });
            this.checker.prop('checked', this.market != null);

            this.checker.on('change', ev => this.onClick(ev));

            var label = $('<label/>', { text: this.name, title: this.description, 'for': this.seq });

            items.append(this.checker, label);
        }

        private onClick(ev: JQueryEventObject): void {
            if (TheApplication.activeMarket == null) {
                TheApplication.itemScope = this;

                $.mobile.changePage(Details.pageName, { transition: 'none' });
            }
            else {
                if (this.checker.is(':checked')) {
                    this.market = TheApplication.activeMarket.name;
                    this.bought = new Date($.now());
                }
                else {
                    this.market = null;
                    this.bought = null;
                }

                if (this.state == ItemState.Unchanged)
                    this.state = ItemState.Modified;

                this.list.save();
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

        private filter: JQuery;

        private sync: JQuery;

        items: IItem[];

        constructor() {
            this.page = $(List.pageName);
            this.action = this.page.find('#goShopping');
            this.list = this.page.find('[data-role=controlgroup]');
            this.filter = this.page.find('#filter');
            this.sync = this.page.find('#syncItems');

            this.page.find('#newItem').on('click', () => TheApplication.itemScope = null);
            this.page.on('pagebeforeshow', () => this.onShow());

            this.filter.on('change', () => this.loadList());
            this.action.on('click', () => this.onBuy());
            this.sync.on('click', () => this.synchronize());

            var storedItems: IStoredItem[] = JSON.parse(localStorage[List.storageKey] || null) || [];

            this.items = $.map(storedItems, stored => new Item(stored, this));

            this.onShow();
        }

        private synchronize(): void {
            this.sync.addClass(TheApplication.classDisabled);

            User.getUser('???')
                .done(userNameInfo => {
                    // Just in case it failed
                    if (typeof (userNameInfo) != 'object')
                        return;

                    // Renable UI
                    this.sync.removeClass(TheApplication.classDisabled);
                });
        }

        private loadList(): void {
            this.list.empty();

            var all = (this.filter.val() == 1);

            $.each(this.items, (i, item) => {
                if (all || (item.market == null))
                    item.appendTo(this.list);
            });

            this.list.trigger('create');
        }

        save(): void {
            localStorage[List.storageKey] = JSON.stringify(this.items, (key, value) => {
                if (key == 'list')
                    return undefined;
                else
                    return value;
            });
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

        private save: JQuery;

        private delete: JQuery;

        private form: JQuery;

        private name: JQuery;

        private description: JQuery;

        private created: JQuery;

        private bought: JQuery;

        private market: JQuery;

        private header: JQuery;

        constructor(private list: List) {
            this.form = $(Details.pageName);

            this.header = this.form.find('[data-role=header] h1');
            this.description = this.form.find('#itemDescription');
            this.delete = this.form.find('#deleteItem');
            this.bought = this.form.find('#itemBought');
            this.market = this.form.find('#itemMarket');
            this.created = this.form.find('#itemDate');
            this.save = this.form.find('#updateItem');
            this.name = this.form.find('#itemName');

            this.form.on('pagebeforeshow', () => this.onShow());
            this.form.on('pageshow', () => this.name.focus());

            this.save.on('click', () => this.onClose());
            this.delete.on('click', () => this.onDelete());
            this.name.on('change input', () => this.onValidate());
        }

        private getName(): string {
            return (this.name.val() || '').trim();
        }

        private getDescription(): string {
            return (this.description.val() || '').trim();
        }

        private onClose(): void {
            var name = this.getName();
            var description = this.getDescription();
            var item = TheApplication.itemScope;

            if (item == null)
                this.list.items.push(
                    new Item({
                        state: ItemState.NewlyCreated,
                        created: new Date($.now()),
                        description: description,
                        bought: null,
                        market: null,
                        name: name,
                        id: null,
                    }, this.list));
            else {
                item.name = name;
                item.description = description;

                if (item.state == ItemState.Unchanged)
                    item.state = ItemState.Modified;
            }

            this.list.save();
        }

        private onDelete(): void {
            TheApplication.itemScope.state = ItemState.Deleted;

            this.list.save();
        }

        private onValidate(): void {
            var name = this.getName();

            if (name.length > 0)
                this.save.removeClass(TheApplication.classDisabled);
            else
                this.save.addClass(TheApplication.classDisabled);
        }

        private onShow(): void {
            var item = TheApplication.itemScope;

            if (item == null) {
                this.header.text('Neues Produkt anlegen');
                this.save.text('Anlegen');
                this.delete.hide();

                this.name.val('');
                this.bought.val('');
                this.market.val('');
                this.created.val('');
                this.description.val('');
            }
            else {
                this.header.text(item.name);
                this.save.text('Ändern');
                this.delete.show();

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

