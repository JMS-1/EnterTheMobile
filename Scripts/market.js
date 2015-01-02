var Market;
(function (_Market) {
    // Market effective data implementation
    var Market = (function () {
        function Market(fromStore) {
            this.name = fromStore.name;
        }
        Market.prototype.appendTo = function (items) {
            var _this = this;
            var choose = $('<a/>', { text: this.name, href: Item.List.pageName });
            var edit = $('<a/>', { href: Details.pageName });
            choose.on('click', function () { return TheApplication.activeMarket = _this; });
            edit.on('click', function () { return TheApplication.marketScope = _this; });
            items.append($('<li/>').append(choose).append(edit));
        };
        Market.compare = function (left, right) {
            return Market.compareNames(left.name, right.name);
        };
        Market.compareNames = function (left, right) {
            return left.localeCompare(right, undefined, { sensitivity: 'base' });
        };
        return Market;
    })();
    _Market.Market = Market;
    // The market selection list page
    var List = (function () {
        function List() {
            var _this = this;
            this.page = $(List.pageName);
            this.page.on('pagecreate', function () { return _this.onCreated(); });
            this.page.on('pagebeforeshow', function () { return _this.onShow(); });
        }
        // Update the list
        List.prototype.onShow = function () {
            var _this = this;
            // Reset current list view
            this.list.empty();
            // Reestablish list
            $.each(this.markets, function (i, market) { return market.appendTo(_this.list); });
            // Make sure list is mobile enhanced
            this.list.listview('refresh');
        };
        // Update local storage and (!) display
        List.prototype.save = function () {
            // Make sure list is always ordered
            this.markets.sort(Market.compare);
            // Convert to storage format
            localStorage[List.storageKey] = JSON.stringify(this.markets);
        };
        // Call once when the page is created
        List.prototype.onCreated = function () {
            // Locate item list
            this.list = this.page.find('[data-role=listview]');
            // Recover market list from local storage
            var storedMarkets = JSON.parse(localStorage[List.storageKey] || null) || [];
            // Create production classes from pure serialisation
            this.markets = $.map(storedMarkets, function (stored) { return new Market(stored); });
            // Process as change
            this.save();
            // Configure actions
            this.page.find('#newMarket').on('click', function () { return TheApplication.marketScope = null; });
        };
        List.storageKey = 'MarketList';
        List.pageName = '#marketList';
        return List;
    })();
    _Market.List = List;
    // The market details page
    var Details = (function () {
        function Details(list) {
            var _this = this;
            this.list = list;
            this.form = $(Details.pageName);
            this.form.on('pagebeforeshow', function () { return _this.onShow(); });
            this.input = this.form.find('#marketText');
            this.save = this.form.find('#updateMarket');
            this.delete = this.form.find('#deleteMarket');
            this.header = this.form.find('[data-role=header] h1');
            this.save.on('click', function () { return _this.onClose(); });
            this.delete.on('click', function () { return _this.onDelete(); });
            this.input.on('change input', function () { return _this.onValidate(); });
        }
        Details.prototype.getName = function () {
            return (this.input.val() || '').trim();
        };
        // Validate the name
        Details.prototype.onValidate = function () {
            var valid = true;
            var name = this.getName();
            if (name.length < 1)
                // Name must not be empty
                valid = false;
            else
                $.each(this.list.markets, function (i, market) {
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
        };
        // Save the change
        Details.prototype.onClose = function () {
            var name = this.getName();
            if (TheApplication.marketScope == null)
                // Create new
                this.list.markets.push(new Market({ name: name }));
            else
                // Update existing
                TheApplication.marketScope.name = name;
            this.list.save();
        };
        // Delete the current market
        Details.prototype.onDelete = function () {
            var index = this.list.markets.indexOf(TheApplication.marketScope);
            this.list.markets.splice(index, 1);
            this.list.save();
        };
        // Update UI according to current mode of operation
        Details.prototype.onShow = function () {
            if (TheApplication.marketScope == null) {
                this.header.text('Neuen Markt anlegen');
                this.input.val('');
                this.save.text('Anlegen');
                this.delete.hide();
            }
            else {
                this.header.text('Marktdaten verändern');
                this.input.val(TheApplication.marketScope.name);
                this.save.text('Ändern');
                this.delete.show();
            }
            this.onValidate();
        };
        Details.pageName = '#marketDetail';
        return Details;
    })();
    _Market.Details = Details;
})(Market || (Market = {}));
//# sourceMappingURL=market.js.map