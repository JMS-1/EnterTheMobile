
module TheApplication {
    // Global constants
    var classDisabled = 'ui-disabled';

    var homeName = '#homePage';
    var marketListName = '#marketList';
    var marketDetailsName = '#marketDetail';

    // Wrapper instances for all pages
    var marketSelectionList: MarketSelectionList;
    var marketDetails: MarketDetails;
    var homePage: HomePage;

    // Global context
    var currentMarket: IMarket = null;
    var currentDetail: IMarket = null;

    // Synchronized startup code
    $(() => {
        marketSelectionList = new MarketSelectionList($(marketListName));
        marketDetails = new MarketDetails($(marketDetailsName));
        homePage = new HomePage($(homeName));
    });

    // Market raw data as serialized to store
    interface IStoredMarket {
        // Name of the market
        name: string;
    }

    // Market effective data
    interface IMarket extends IStoredMarket {
        // Create list view row for market including selection and edit using split mode
        appendTo(items: JQuery): void;
    }

    // Market effective data implementation
    class Market implements IMarket {
        constructor(fromStore: IStoredMarket) {
            this.name = fromStore.name;
        }

        name: string;

        appendTo(items: JQuery): void {
            var choose = $('<a/>', { text: this.name, href: homeName });
            var edit = $('<a/>', { href: marketDetailsName });

            choose.on('click', () => currentMarket = this);
            edit.on('click', () => currentDetail = this);

            items
                .append($('<li/>')
                    .append(choose)
                    .append(edit));
        }

        static compare(left: IStoredMarket, right: IStoredMarket): number {
            return Market.compareNames(left.name, right.name);
        }

        static compareNames(left: string, right: string): number {
            return left.localeCompare(right, undefined , { sensitivity: 'base' });
        }
    }

    // The home page of it all
    class HomePage {
        private action: JQuery;

        constructor(private list: JQuery) {
            this.action = this.list.find('#goShopping');

            list.on('pagebeforeshow', () => this.onShow());
            this.action.on('click', () => this.onBuy());

            this.onShow();
        }

        // Action on the BUY button
        private onBuy(): boolean {
            // If no market is selected it's time to select it now
            if (currentMarket == null)
                return true;

            // Done with market
            currentMarket = null;

            // Refresh the UI
            this.onShow();

            // And stay where we are
            return false;
        }

        // Adapt UI to current operation mode
        private onShow(): void {
            var headerText = this.list.find('[data-role=header] h1');
            var market = currentMarket;

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

    // The market selection list page
    class MarketSelectionList {
        private static storageKey = 'MarketList';

        markets: IMarket[];

        private items: JQuery;

        constructor(private list: JQuery) {
            list.on('pagecreate', () => this.onCreated());
            list.on('pagebeforeshow', () => this.onShow());
        }

        // Update the list
        private onShow(): void {
            // Reset current list view
            this.items.empty();

            // Reestablish list
            $.each(this.markets, (i, market) => market.appendTo(this.items));

            // Make sure list is mobile enhanced
            this.items.listview('refresh');
        }

        // Update local storage and (!) display
        save(): void {
            // Make sure list is always ordered
            this.markets.sort(Market.compare);

            // Convert to storage format
            localStorage[MarketSelectionList.storageKey] = JSON.stringify(this.markets);
        }

        // Call once when the page is created
        private onCreated(): void {
            // Recover market list from local storage
            var storedMarkets: IStoredMarket[] = JSON.parse(localStorage[MarketSelectionList.storageKey] || null) || [];

            // Create production classes from pure serialisation
            this.markets = $.map(storedMarkets, stored => new Market(stored));

            // Locate item list
            this.items = this.list.find('[data-role=listview]');

            // Process as change
            this.save();

            // Configure actions
            this.list.find('#newMarket').on('click', () => currentDetail = null);
        }
    }

    // The market details page
    class MarketDetails {
        // Update action - either create new or modify existing
        private save: JQuery;

        // Delete action - only for existing
        private delete: JQuery;

        // Header text element
        private header: JQuery;

        // Name input element
        private input: JQuery;

        constructor(private list: JQuery) {
            this.input = list.find('#marketText');
            this.save = list.find('#updateMarket');
            this.delete = list.find('#deleteMarket');
            this.header = list.find('[data-role=header] h1');

            list.on('pagebeforeshow', () => this.onShow());
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
                $.each(marketSelectionList.markets, (i, market) => {
                    // Name not in use
                    if (Market.compareNames(name, market.name) != 0)
                        return true;

                    // This is the one we are modifying
                    if (market === currentDetail)
                        return true;

                    // Name clash
                    valid = false;
                    return false;
                });

            // Update UI accordingly
            if (valid)
                this.save.removeClass(classDisabled);
            else
                this.save.addClass(classDisabled);
        }

        // Save the change
        private onClose(): void {
            var name = this.getName();

            if (currentDetail == null)
                // Create new
                marketSelectionList.markets.push(new Market({ name: name }));
            else
                // Update existing
                currentDetail.name = name;

            marketSelectionList.save();
        }

        // Delete the current market
        private onDelete(): void {
            var index = marketSelectionList.markets.indexOf(currentDetail);

            marketSelectionList.markets.splice(index, 1);
            marketSelectionList.save();
        }

        // Update UI according to current mode of operation
        private onShow(): void {
            if (currentDetail == null) {
                this.header.text('Neuen Markt anlegen');
                this.input.val('');
                this.save.text('Anlegen');
                this.delete.hide();
            }
            else {
                this.header.text('Marktdaten verändern');
                this.input.val(currentDetail.name);
                this.save.text('Ändern');
                this.delete.show();
            }

            this.onValidate();
        }
    }
}