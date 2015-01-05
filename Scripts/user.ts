
/*
    Verwaltet alles rund um die einmalig Anwendung des Benutzers.
*/
module User {
    var userIdStoreName = 'JMSBuy.UserIdentifier';
    var userStoreName = 'JMSBuy.UserName';

    // Daten aus der lokalen Ablage auslesen
    var userId = localStorage[userIdStoreName] || '';
    var userName = localStorage[userStoreName] || '';

    // Meldet die eindeutige Kennung des Anwenders aus der Datenbank.
    export function getUserId(): string {
        return userId;
    };

    // Meldet den Namen des Anwenders aus der Datenbank.
    export function getUserName(): string {
        return userName;
    };

    // Setzt Name und Benutzerkennung und überträgt sie in die lokale Ablage.
    export function setUserId(newUserId: string, newUserName: string): void {
        userId = newUserId.trim();
        userName = newUserName;

        localStorage[userIdStoreName] = userId;
        localStorage[userStoreName] = newUserName;
    }

    // Ergebnisstruktur einer Anmeldung.
    export interface IUserName {
        name: string;
    }

    // Startet eine asynchrone Anmeldung.
    export function getUser(userid: string): JQueryPromise<IUserName> {
        return $.ajax({
            data: JSON.stringify({ userid: userid }),
            contentType: 'application/json',
            url: 'user.php',
            type: 'POST',
        });
    }
}
