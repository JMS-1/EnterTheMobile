<?php
	include('connect.php');

	$userid = 'BC4A471061274EECBBDD4F945B00E6D0';

	$qryById = $con->prepare('SELECT name FROM buyUsers WHERE userid = ?');
	$qryById->bind_param('s', $userid);
	$qryById->execute();

	$qryById->bind_result($name);
	if($qryById->fetch()){
		echo $name;
	}
	
	$qryById->free_result();

	$con->close();
?>