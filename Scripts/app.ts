
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
        constructor(private list: JQuery) {
            list.on('pagebeforeshow', () => this.onShow());

            this.onShow();
        }

        private onShow(): void {
            var headerText = this.list.find('[data-role=header] h1');
            var market = currentMarket;

            if (market == null)
                headerText.text('Deine Einkaufsliste');
            else
                headerText.text('Einkaufen bei ' + market.name);
        }
    }

    // The market selection list page
    class MarketSelectionList {
        private static storageKey = 'MarketList';

        private markets: IMarket[];

        private items: JQuery;

        constructor(private list: JQuery) {
            list.on('pagecreate', () => this.onCreated());
        }

        private load(): void {
            var storedMarkets: IStoredMarket[] = JSON.parse(localStorage[MarketSelectionList.storageKey] || null) || [];

            this.markets = $.map(storedMarkets, stored => new Market(stored));
            this.markets.sort(Market.compare);

            $.each(this.markets, (i, market) => market.appendTo(this.items));

            this.items.listview('refresh');
        }

        private save(): void {
            localStorage[MarketSelectionList.storageKey] = JSON.stringify(this.markets);
        }

        private onCreated(): void {
            this.list.find('#newMarket').on('click', () => Market.detailsScope = null);

            this.items = this.list.find('[data-role=listview]');
            this.load();
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