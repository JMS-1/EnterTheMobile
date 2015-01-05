<?php
	include('connect.php');

	// Zustand eines Produktes, so wie es auch in der Anwendung definiert ist
	class ItemState {
		// Das Produkt wurde neu angelegt
        const NewlyCreated = 0;

		// Das Produkt wurde gelöscht
        const Deleted = 1;

		// Die Produktdaten wurden verändert
        const Modified = 2;

		// Das Produkt ist unverändert
        const Unchanged = 3;
    }

	// Die Anfrage im JSON Format wird ausgewertet
	$request = file_get_contents('php://input');
	$json = json_decode($request, true);
	$userid = $json['userid'];
	$items = $json['items'];

	// Wir verwenden Transaktionen
	$con->autocommit(false);

	// Alle Variablen, die wir in Bindungen verwenden, werden vorab definiert - das macht ein paar Abläufe einfacher
	$description = null;
	$created = null;
	$bought = null;
	$market = null;
	$state = null;
	$name = null;
	$id = null;

	// Die einzelnen Befehle zum Anlegen, Löschen, Ändern und Auslesen werden vorbereitet
	$insert = $con->prepare('INSERT INTO buyList (userid, item, description, added) VALUES(?, ?, ?, FROM_UNIXTIME(?))');
	$insert->bind_param('sssi', $userid, $name, $description, $created);

	$delete = $con->prepare('DELETE FROM buyList WHERE userid = ? AND id = ?');
	$delete->bind_param('si', $userid, $id);
	
	$update = $con->prepare('UPDATE buyList SET item = ?, description = ?, bought = FROM_UNIXTIME(?), `where` = ? WHERE userid = ? AND id = ?');
	$update->bind_param('ssissi', $name, $description, $bought, $market, $userid, $id);
	
	$query = $con->prepare('SELECT id, item, description, UNIX_TIMESTAMP(added) FROM buyList WHERE userid = ? AND (bought IS NULL OR `where` IS NULL) ORDER BY id');
	$query->bind_param('s', $userid);
	$query->bind_result($id, $name, $description, $created);

	// Alle Offline veränderten Produkte werden untersucht
	foreach($items as $item){
		// Wir füllen alle potentiell verwendeten Bindingsvariablen - das macht den Programmcode etwas einfacher
		$created = strtotime($item['created']);
		$description = $item['description'];
		$bought = $item['bought'];
		$market = $item['market'];
		$state = $item['state'];
		$name = $item['name'];
		$id = $item['id'];

		// Abhängig vom Zustand ausführen
		switch ($state){
			case ItemState::NewlyCreated:{
				$insert->execute();
				break;
			}
			
			case ItemState::Deleted:{
				$delete->execute();
				break;
			}

			case ItemState::Modified:{
				// Ein JSON Datum wird hier in der internen Zahldarstellung verwendet
				if($bought != null)
					$bought = strtotime($bought);

				$update->execute();
				break;
			}

			default: {
				// Aufräumen
				$insert->close();
				$delete->close();
				$update->close();
				$con->rollback();
				$con->close();

				// Und ärgern
				die('Unbekannter Zustand ' . $state);
			}
		}
	}

	// Hier sammeln wir die Produkte, die als Ergebnis gemeldet werden
	$results = array();

	// Produkte des Anwenders aus der Datenbank auslesen
	$query->execute();

	while ($query->fetch()) {
		// Einzelergebnis zusammenstellen
		$result['created'] = date('c', $created);
		$result['state'] = ItemState::Unchanged;
		$result['description'] = $description;
		$result['bought'] = null;
		$result['market'] = null;
		$result['name'] = $name;
		$result['id'] = $id;

		// Und im Gesamtergebnis sammeln
		array_push($results, $result);
	}

	// Ressourcen freigeben
	$insert->close();
	$delete->close();
	$update->close();
	$query->close();
	$con->commit();
	$con->close();

	// Wir werden im JSON Format antworten
	header('Content-Type: application/json');

	// Ergebnis zusammenstellen und senden
	$response['items'] = $results;

	echo json_encode($response);
?>