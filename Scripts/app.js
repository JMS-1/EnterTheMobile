var TheApplication;
(function (TheApplication) {
    var classDisabled = 'ui-disabled';
    TheApplication.activeMarket = null;
    TheApplication.marketScope = null;
    TheApplication.itemScope = null;
    $(function () {
        var itemList = new Item.List();
        var itemDetails = new Item.Details(itemList);
        var marketSelectionList = new Market.List();
        var marketDetails = new Market.Details(marketSelectionList);
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
        function Master(pageName, listSelector, addName) {
            var _this = this;
            this.page = $(pageName);
            this.list = this.page.find(listSelector);
            this.page.find(addName).on('click', function () { return _this.createNew(); });
            this.page.on('pagecreate', function () { return _this.loadList(); });
            this.page.on('pagebeforeshow', function () { return _this.fillList(); });
        }
        Master.prototype.fillList = function () {
            throw 'fillList is abstract';
        };
        Master.prototype.save = function () {
            throw 'save is abstract';
        };
        Master.prototype.loadList = function () {
            throw 'save is abstract';
        };
        Master.prototype.createNew = function () {
            throw 'createNew is abstract';
        };
        return Master;
    })();
    TheApplication.Master = Master;
    var Detail = (function () {
        function Detail(pageName, saveName, deleteName, list) {
            var _this = this;
            this.list = list;
            this.form = $(pageName);
            this.form.on('pagebeforeshow', function () { return _this.onPreShow(); });
            this.save = this.form.find(saveName);
            this.delete = this.form.find(deleteName);
            this.header = this.form.find('[data-role=header] h1');
            this.save.on('click', function () { return _this.onSave(); });
            this.delete.on('click', function () { return _this.onDelete(); });
        }
        Detail.prototype.prepareSave = function () {
            throw 'prepareSave is abstract';
        };
        Detail.prototype.onSave = function () {
            this.prepareSave();
            this.list.save();
        };
        Detail.prototype.prepareDelete = function () {
            throw 'prepareDelete is abstract';
        };
        Detail.prototype.onDelete = function () {
            this.prepareDelete();
            this.list.save();
        };
        Detail.prototype.onPreShow = function () {
            throw 'onPreShow is abstract';
        };
        return Detail;
    })();
    TheApplication.Detail = Detail;
})(TheApplication || (TheApplication = {}));
//# sourceMappingURL=app.js.map