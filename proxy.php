<?php

$remote_url = $_GET['url'];

// Set the appropriate header so the response is treated as JSON
header('Content-Type: application/json');

// Make the request to the remote server and return the response
echo file_get_contents($remote_url);