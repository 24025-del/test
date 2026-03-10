<?php
/**
 * api/contact.php - Contact Controller
 */

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    session_start();
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
         sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
    }
    
    $stmt = $pdo->query("SELECT * FROM contact_messages ORDER BY created_at DESC");
    sendResponse($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_GET['action'] ?? '';
    $input = getJsonInput();
    
    if ($action === 'mark_read') {
        session_start();
        if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
             sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
        }
        $stmt = $pdo->prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?");
        $stmt->execute([$input['id'] ?? null]);
        sendResponse(["status" => "success"]);
    } else {
        // Public endpoint to send messages
        try {
            $id = generateUUID();
            $stmt = $pdo->prepare("INSERT INTO contact_messages (id, name, email, message) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $id,
                htmlspecialchars($input['name'] ?? ''),
                filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL),
                htmlspecialchars($input['message'] ?? '')
            ]);
            sendResponse(["status" => "success", "id" => $id]);
        } catch (Exception $e) {
            sendResponse(["status" => "error", "message" => $e->getMessage()], 400);
        }
    }
}
