<?php
$data = [
    'email' => 'admin@gmail.com',
    'password' => 'admin'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];

$context  = stream_context_create($options);
$result = file_get_contents('http://localhost:8000/auth.php?action=signin', false, $context);
$status_line = $http_response_header[0];

echo "Status: $status_line\n";
echo "Response: $result\n";
