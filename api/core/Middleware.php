<?php
/**
 * api/core/Middleware.php
 */

class Middleware {
    public static function setSecurityHeaders() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowed_origins = [
            'http://localhost:8080',
            'http://localhost:5173', 
            'http://localhost:3000', 
            'http://localhost'
        ];
        
        if (in_array($origin, $allowed_origins) || empty($origin)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Credentials: true");
        }

        header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        
        header("X-Content-Type-Options: nosniff");
        header("X-Frame-Options: DENY");
        header("X-XSS-Protection: 1; mode=block");
        header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
        header("Content-Security-Policy: default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'none';");
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }

    public static function sendResponse($data, $statusCode = 200) {
        if (ob_get_length()) ob_clean();
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function getJsonInput() {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    public static function checkAuth() {
        // Basic session check or JWT can go here
        session_start();
        if (!isset($_SESSION['user_id'])) {
            self::sendResponse(["status" => "error", "message" => "Unauthorized access"], 401);
        }
    }
}
