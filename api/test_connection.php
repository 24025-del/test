<?php
require_once 'api/core/Config.php';
require_once 'api/core/Database.php';

try {
    Config::load();
    $pdo = Database::getInstance();
    echo "Connection successful!\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $count = $stmt->fetchColumn();
    echo "Number of users: $count\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
