var User;
(function (User) {
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