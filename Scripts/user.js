var User;
(function (User) {
    var userIdStoreName = 'JMSBuy.UserIdentifier';
    var userStoreName = 'JMSBuy.UserName';
    var userId = localStorage[userIdStoreName] || '';
    var userName = localStorage[userStoreName] || '';
    function getUserId() {
        return userId;
    }
    User.getUserId = getUserId;
    ;
    function getUserName() {
        return userName;
    }
    User.getUserName = getUserName;
    ;
    function setUserId(newUserId, newUserName) {
        userId = newUserId.trim();
        userName = newUserName;
        localStorage[userIdStoreName] = userId;
        localStorage[userStoreName] = newUserName;
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