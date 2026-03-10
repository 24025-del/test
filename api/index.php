<?php
/**
 * api/index.php - Unified Router for the Application
 */

require_once __DIR__ . '/core/Config.php';
require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/core/Middleware.php';

// Load configurations
Config::load();

// Error logging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

// Set headers
Middleware::setSecurityHeaders();

// Route parsing
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/api/', '', $uri);

if (empty($path)) {
    Middleware::sendResponse(["status" => "ok", "message" => "Blood Donation API is running"]);
}

// Simple legacy mapping to facilitate refactoring
$legacyRoutes = [
    'auth.php' => 'auth.php',
    'cities.php' => 'cities.php',
    'profiles.php' => 'profiles.php',
    'requests.php' => 'requests.php',
    'notifications.php' => 'notifications.php',
    'contact.php' => 'contact.php',
    'admin.php' => 'admin.php',
    'mailer.php' => 'mailer.php',
];

if (isset($legacyRoutes[$path])) {
    require_once __DIR__ . '/' . $legacyRoutes[$path];
    exit;
}

// Next steps: fully separate controllers and implement a better router
Middleware::sendResponse(["status" => "error", "message" => "Route not found"], 404);
