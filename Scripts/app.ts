
module TheApplication {
    var marketSelectionList: MarketSelectionList;

    // Synchronized startup code
    $(() => {
        marketSelectionList = new MarketSelectionList($('#marketList'));
    });

    class Market {
        name: string;
    }

    class MarketSelectionList {
        private static storageKey = 'MarketList';

        private markets: Market[];

        private items: JQuery;

        constructor(private list: JQuery) {
            list.on('pagecreate', () => this.onCreated());
        }

        private add(market: Market): void {
            $('<li>', { text: market.name }).appendTo(this.items);
        }

        private load(): void {
            this.markets = JSON.parse(localStorage[MarketSelectionList.storageKey] || null) || [];

            this.markets.sort((l, r) => l.name.localeCompare(r.name));

            $.each(this.markets, (i, market) => this.add(market));

            this.items.listview('refresh');
        }

        private save(): void {
            localStorage[MarketSelectionList.storageKey] = JSON.stringify(this.markets);
        }

        private onCreated(): void {
            this.items = this.list.find('[data-role=listview]');

            this.load();
        }
    }
}