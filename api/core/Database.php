<?php
/**
 * api/core/Database.php
 */

require_once __DIR__ . '/Config.php';

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        $host = Config::get('DB_HOST', 'localhost');
        $db   = Config::get('DB_NAME', 'blood_don');
        $user = Config::get('DB_USER', 'root'); // Default to root for local dev
        $pass = Config::get('DB_PASSWORD', '');
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->pdo = new PDO($dsn, $user, $pass, $options);
        } catch (\PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            header('Content-Type: application/json', true, 500);
            echo json_encode(["status" => "error", "message" => "Database connection failed"]);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance->pdo;
    }
}
