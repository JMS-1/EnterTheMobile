
module TheApplication {
    // Global constants
    export var classDisabled = 'ui-disabled';
    export var homeName = '#homePage';

    // Global context
    export var currentMarket: Market.IMarket = null;
    export var currentDetail: Market.IMarket = null;

    // Synchronized startup code
    $(() => {
        var homePage = new HomePage($(homeName));

        // Market management
        var marketSelectionList = new Market.List();
        var marketDetails = new Market.Details(marketSelectionList);
    });

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
}