
module Market {
    // Market raw data as serialized to store
    export interface IStoredMarket {
        // Name of the market
        name: string;
    }

    // Market effective data
    export interface IMarket extends IStoredMarket {
        // Create list view row for market including selection and edit using split mode
        appendTo(items: JQuery): void;
    }

    // Market effective data implementation
    export class Market implements IMarket {
        constructor(fromStore: IStoredMarket) {
            this.name = fromStore.name;
        }

        name: string;

        appendTo(items: JQuery): void {
            var choose = $('<a/>', { text: this.name, href: Item.List.pageName });
            var edit = $('<a/>', { href: Details.pageName });

            choose.on('click', () => TheApplication.activeMarket = this);
            edit.on('click', () => TheApplication.marketScope = this);

            items
                .append($('<li/>')
                    .append(choose)
                    .append(edit));
        }

        static compare(left: IStoredMarket, right: IStoredMarket): number {
            return Market.compareNames(left.name, right.name);
        }

        static compareNames(left: string, right: string): number {
            return left.localeCompare(right, undefined, { sensitivity: 'base' });
        }
    }

    // The market selection list page
    export class List {
        private static storageKey = 'MarketList';

        private static pageName = '#marketList';

        private list: JQuery;

        private page: JQuery;

        markets: IMarket[];

        constructor() {
            this.page = $(List.pageName);

            this.page.on('pagecreate', () => this.onCreated());
            this.page.on('pagebeforeshow', () => this.onShow());
        }

        // Update the list
        private onShow(): void {
            // Reset current list view
            this.list.empty();

            // Reestablish list
            $.each(this.markets, (i, market) => market.appendTo(this.list));

            // Make sure list is mobile enhanced
            this.list.listview('refresh');
        }

        // Update local storage and (!) display
        save(): void {
            // Make sure list is always ordered
            this.markets.sort(Market.compare);

            // Convert to storage format
            localStorage[List.storageKey] = JSON.stringify(this.markets);
        }

        // Call once when the page is created
        private onCreated(): void {
            // Locate item list
            this.list = this.page.find('[data-role=listview]');

            // Recover market list from local storage
            var storedMarkets: IStoredMarket[] = JSON.parse(localStorage[List.storageKey] || null) || [];

            // Create production classes from pure serialisation
            this.markets = $.map(storedMarkets, stored => new Market(stored));

            // Process as change
            this.save();

            // Configure actions
            this.page.find('#newMarket').on('click', () => TheApplication.marketScope = null);
        }
    }

    // The market details page
    export class Details {
        static pageName = '#marketDetail';

        // Update action - either create new or modify existing
        private save: JQuery;

        // Delete action - only for existing
        private delete: JQuery;

        // Header text element
        private header: JQuery;

        // Name input element
        private input: JQuery;

        // The UI
        private form: JQuery;

        constructor(private list: List) {
            this.form = $(Details.pageName);

            this.form.on('pagebeforeshow', () => this.onShow());
            this.form.on('pageshow', () => this.input.focus());

            this.input = this.form.find('#marketText');
            this.save = this.form.find('#updateMarket');
            this.delete = this.form.find('#deleteMarket');
            this.header = this.form.find('[data-role=header] h1');

            this.save.on('click', () => this.onClose());
            this.delete.on('click', () => this.onDelete());
            this.input.on('change input', () => this.onValidate());
        }

        private getName(): string {
            return (this.input.val() || '').trim();
        }

        // Validate the name
        private onValidate(): void {
            var valid = true;
            var name = this.getName();

            if (name.length < 1)
                // Name must not be empty
                valid = false;
            else
                $.each(this.list.markets, (i, market) => {
                    // Name not in use
                    if (Market.compareNames(name, market.name) != 0)
                        return true;

                    // This is the one we are modifying
                    if (market === TheApplication.marketScope)
                        return true;

                    // Name clash
                    valid = false;
                    return false;
                });

            // Update UI accordingly
            if (valid)
                this.save.removeClass(TheApplication.classDisabled);
            else
                this.save.addClass(TheApplication.classDisabled);
        }

        // Save the change
        private onClose(): void {
            var name = this.getName();

            if (TheApplication.marketScope == null)
                // Create new
                this.list.markets.push(new Market({ name: name }));
            else
                // Update existing
                TheApplication.marketScope.name = name;

            this.list.save();
        }

        // Delete the current market
        private onDelete(): void {
            var index = this.list.markets.indexOf(TheApplication.marketScope);

            this.list.markets.splice(index, 1);
            this.list.save();
        }

        // Update UI according to current mode of operation
        private onShow(): void {
            if (TheApplication.marketScope == null) {
                this.header.text('Neuen Markt anlegen');
                this.save.text('Anlegen');
                this.delete.hide();

                this.input.val('');
            }
            else {
                this.header.text('Marktdaten verändern');
                this.save.text('Ändern');
                this.delete.show();

                this.input.val(TheApplication.marketScope.name);
            }

            this.onValidate();
        }
    }
}

