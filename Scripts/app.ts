
module TheApplication {
    var homeName = '#homePage';
    var marketListName = '#marketList';
    var marketDetailsName = '#marketDetail';

    var marketSelectionList: MarketSelectionList;
    var marketDetails: MarketDetails;
    var homePage: HomePage;

    // Set as soon as we start buying
    var currentMarket: IMarket = null;

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
        // Current market for details form
        static detailsScope: IMarket;

        constructor(fromStore: IStoredMarket) {
            this.name = fromStore.name;
        }

        name: string;

        appendTo(items: JQuery): void {
            var choose = $('<a/>', { text: this.name, href: homeName });
            var edit = $('<a/>', { href: marketDetailsName });

            choose.on('click', () => currentMarket = this);
            edit.on('click', () => Market.detailsScope = this);

            items
                .append($('<li/>')
                    .append(choose)
                    .append(edit));
        }

        static compare(left: IStoredMarket, right: IStoredMarket): number {
            return left.name.localeCompare(right.name);
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

        private markets: IMarket[];

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
        private save(): void {
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
            this.list.find('#newMarket').on('click', () => Market.detailsScope = null);
        }
    }

    // The market details page
    class MarketDetails {
        constructor(private list: JQuery) {
            list.on('pagebeforeshow', () => this.onShow());
        }

        private onShow(): void {
            var headerText = this.list.find('[data-role=header] h1');
            var market = Market.detailsScope;

            if (market == null)
                headerText.text('Neuen Markt anlegen');
            else
                headerText.text('Marktdaten verändern');
        }
    }
}