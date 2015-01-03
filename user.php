<?php
	include('connect.php');

	// Analyse request data
	$request = file_get_contents('php://input');
	$json = json_decode($request, true);
	$userid = $json['userid'];

	// Query the user
	$qryById = $con->prepare('SELECT name FROM buyUsers WHERE userid = ?');
	$qryById->bind_param('s', $userid);
	$qryById->execute();

	// Retrieve the result
	$qryById->bind_result($name);
	if(!$qryById->fetch())
		$name = '';  

	$qryById->close();
	$con->close();
  
	// Construct response
	$result['name'] = $name;

	// Report response
	header('Content-Type: application/json');

	echo json_encode($result);
?>