
module Item {
    // The home page of it all
    export class List {
        static pageName = '#itemList';

        private action: JQuery;

        private list: JQuery;

        constructor() {
            this.list = $(List.pageName);
            this.action = this.list.find('#goShopping');

            this.list.on('pagebeforeshow', () => this.onShow());
            this.action.on('click', () => this.onBuy());

            this.onShow();
        }

        // Action on the BUY button
        private onBuy(): boolean {
            // If no market is selected it's time to select it now
            if (TheApplication.currentMarket == null)
                return true;

            // Done with market
            TheApplication.currentMarket = null;

            // Refresh the UI
            this.onShow();

            // And stay where we are
            return false;
        }

        // Adapt UI to current operation mode
        private onShow(): void {
            var headerText = this.list.find('[data-role=header] h1');
            var market = TheApplication.currentMarket;

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

 