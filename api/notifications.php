<?php
/**
 * api/notifications.php - Notifications Controller
 */

require_once 'db.php';
session_start();

$action = $_GET['action'] ?? '';
$input = getJsonInput();

if (!isset($_SESSION['user_id'])) {
    sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['userId'] ?? null;
    if (!$userId) sendResponse([]);

    // Security check: Only self or admin
    $stmt = $pdo->prepare("SELECT user_id FROM profiles WHERE id = ?");
    $stmt->execute([$userId]);
    $owner = $stmt->fetch();
    if (!$owner || ($_SESSION['user_id'] !== $owner['user_id'] && $_SESSION['role'] !== 'admin')) {
         sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
    }

    $stmt = $pdo->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 100");
    $stmt->execute([$userId]);
    sendResponse($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'mark_read') {
        $id = $input['id'] ?? null;
        if (!$id) sendResponse(["status" => "error", "message" => "Missing ID"], 400);

        // Security check
        $stmt = $pdo->prepare("SELECT user_id FROM notifications WHERE id = ?");
        $stmt->execute([$id]);
        $notif = $stmt->fetch();
        
        if (!$notif || ($_SESSION['user_id'] !== $notif['user_id'] && $_SESSION['role'] !== 'admin')) {
             sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
        }

        $stmt = $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["status" => "success"]);
    }
}
