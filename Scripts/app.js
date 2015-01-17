var TheApplication;
(function (TheApplication) {
    var classDisabled = 'ui-disabled';
    TheApplication.activeMarket = null;
    TheApplication.marketScope = null;
    TheApplication.itemScope = null;
    $(function () {
        $.mobile.hashListeningEnabled = false;
        var itemList = new Item.List();
        var itemDetails = new Item.Details(itemList);
        var marketSelectionList = new Market.MarketList();
        var marketDetails = new Market.MarketItem(marketSelectionList);
        window.applicationCache.addEventListener('updateready', function () {
            if (window.applicationCache.status == ApplicationCache.UPDATEREADY)
                window.location.reload();
        });
    });
    function disable(nodes) {
        nodes.addClass(classDisabled);
    }
    TheApplication.disable = disable;
    function enable(nodes) {
        nodes.removeClass(classDisabled);
    }
    TheApplication.enable = enable;
    function formatNumberForDateTime(n) {
        var s = n.toString();
        return (s.length == 2) ? s : ('0' + s);
    }
    function formatDateTime(dateTime) {
        var month = dateTime.getMonth() + 1;
        var minute = dateTime.getMinutes();
        var hour = dateTime.getHours();
        var day = dateTime.getDate();
        return formatNumberForDateTime(day) + '.' + formatNumberForDateTime(month) + '. ' + formatNumberForDateTime(hour) + ':' + formatNumberForDateTime(minute);
    }
    TheApplication.formatDateTime = formatDateTime;
    var Master = (function () {
        function Master(pageSelector, listSelector, newSelector) {
            var _this = this;
            this.page = $(pageSelector);
            this.list = this.page.find(listSelector);
            this.page.find(newSelector).on('click', function () { return _this.createNew(); });
            this.page.on('pagecreate', function () { return _this.loadFromStorage(); });
            this.page.on('pagebeforeshow', function () { return _this.refreshPage(); });
        }
        Master.prototype.refreshPage = function () {
            throw 'refreshPage is abstract';
        };
        Master.prototype.save = function () {
            throw 'save is abstract';
        };
        Master.prototype.loadFromStorage = function () {
            throw 'loadFromStorage is abstract';
        };
        Master.prototype.createNew = function () {
            throw 'createNew is abstract';
        };
        return Master;
    })();
    TheApplication.Master = Master;
    var Detail = (function () {
        function Detail(pageSelector, saveSelector, deleteSelector, master) {
            var _this = this;
            this.master = master;
            this.form = $(pageSelector);
            this.form.on('pagebeforeshow', function () { return _this.initializeForm(); });
            this.save = this.form.find(saveSelector);
            this.save.on('click', function () { return _this.onSave(); });
            this.delete = this.form.find(deleteSelector);
            this.delete.on('click', function () { return _this.onDelete(); });
            this.header = this.form.find('[data-role=header] h1');
        }
        Detail.prototype.saveChanges = function () {
            throw 'saveChanges is abstract';
        };
        Detail.prototype.onSave = function () {
            this.saveChanges();
            this.master.save();
        };
        Detail.prototype.deleteItem = function () {
            throw 'deleteItem is abstract';
        };
        Detail.prototype.onDelete = function () {
            this.deleteItem();
            this.master.save();
        };
        Detail.prototype.initializeForm = function () {
            throw 'initializeForm is abstract';
        };
        return Detail;
    })();
    TheApplication.Detail = Detail;
})(TheApplication || (TheApplication = {}));
//# sourceMappingURL=app.js.map