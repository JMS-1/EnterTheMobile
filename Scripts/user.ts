
module User {
    var userIdStoreName = 'JMSBuy.UserIdentifier';
    var userId = localStorage[userIdStoreName] || '';

    export function getUserId(): string {
        return userId;
    };

    export function setUserId(newUserId: string): void {
        userId = newUserId.trim();

        localStorage[userIdStoreName] = userId;
    }

    export interface IUserName {
        name: string;
    }

    export function getUser(userid: string): JQueryPromise<IUserName> {
        return $.ajax({
            data: JSON.stringify({ userid: userid }),
            contentType: 'application/json',
            url: 'user.php',
            type: 'POST',
        });
    }
}
