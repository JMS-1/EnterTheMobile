
module User {
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

 