<?php
	include('connect.php');

	class ItemState {
        const NewlyCreated = 0;

        const Deleted = 1;

        const Modified = 2;

        const Unchanged = 3;
    }

	// Begin transaction
	$con->autocommit(false);

	// All variables needed in bindings
	$description = null;
	$created = null;
	$bought = null;
	$market = null;
	$state = null;
	$name = null;
	$id = null;

	// Create commands
	$insert = $con->prepare('INSERT INTO buyList (userid, item, description, added) VALUES(?, ?, ?, FROM_UNIXTIME(?))');
	$insert->bind_param('sssi', $userid, $name, $description, $created);

	$delete = $con->prepare('DELETE FROM buyList WHERE userid = ? AND id = ?');
	$delete->bind_param('si', $userid, $id);
	
	$update = $con->prepare('UPDATE buyList SET item = ?, description = ?, bought = FROM_UNIXTIME(?), `where` = ? WHERE userid = ? AND id = ?');
	$update->bind_param('ssissi', $name, $description, $bought, $market, $userid, $id);
	
	$query = $con->prepare('SELECT id, item, description, UNIX_TIMESTAMP(added) FROM buyList WHERE userid = ? AND (bought IS NULL OR `where` IS NULL) ORDER BY id');
	$query->bind_param('s', $userid);
	$query->bind_result($id, $name, $description, $created);

	// Analyse request data
	$request = file_get_contents('php://input');
	$json = json_decode($request, true);
	$userid = $json['userid'];
	$items = $json['items'];

	foreach($items as $item){
		// Prepare all bindings - makes code a bit clearer
		$created = strtotime($item['created']);
		$description = $item['description'];
		$bought = $item['bought'];
		$market = $item['market'];
		$state = $item['state'];
		$name = $item['name'];
		$id = $item['id'];

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
				// Convert JSON date time string to internal number representation
				if($bought != null)
					$bought = strtotime($bought);

				$update->execute();

				break;
			}

			default: {
				$insert->close();
				$delete->close();
				$update->close();
				$con->rollback();
				$con->close();

				die('Unbekannter Zustand ' . $state);
			}
		}
	}

	// Prepare result
	$results = array();

	// Create response query
	$query->execute();

	// All current items
	while ($query->fetch()) {
		$result['created'] = date('c', $created);
		$result['state'] = ItemState::Unchanged;
		$result['description'] = $description;
		$result['bought'] = null;
		$result['market'] = null;
		$result['name'] = $name;
		$result['id'] = $id;

		array_push($results, $result);
	}

	// Finish database
	$insert->close();
	$delete->close();
	$update->close();
	$query->close();
	$con->commit();
	$con->close();

	// Report response
	header('Content-Type: application/json');

	$results['items'] = $results;

	echo json_encode($results);
?>