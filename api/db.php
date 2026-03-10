<?php
/**
 * api/db.php
 * Thin backwards compatibility layer for old scripts.
 */

require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/core/Middleware.php';

$pdo = Database::getInstance();

function sendResponse($data, $statusCode = 200) {
    Middleware::sendResponse($data, $statusCode);
}

function getJsonInput() {
    return Middleware::getJsonInput();
}

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

function setSecurityHeaders() {
    Middleware::setSecurityHeaders();
}
