var User;
(function (User) {
    var userIdStoreName = 'JMSBuy.UserIdentifier';
    var userId = localStorage[userIdStoreName] || '';
    function getUserId() {
        return userId;
    }
    User.getUserId = getUserId;
    ;
    function setUserId(newUserId) {
        userId = newUserId.trim();
        localStorage[userIdStoreName] = userId;
    }
    User.setUserId = setUserId;
    function getUser(userid) {
        return $.ajax({
            data: JSON.stringify({ userid: userid }),
            contentType: 'application/json',
            url: 'user.php',
            type: 'POST',
        });
    }
    User.getUser = getUser;
})(User || (User = {}));
//# sourceMappingURL=user.js.map