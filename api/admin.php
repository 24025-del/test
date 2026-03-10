<?php
/**
 * api/admin.php - Admin Controller
 */

require_once 'db.php';
session_start();

// Strict Admin Check
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
     sendResponse(["status" => "error", "message" => "Access denied. Admins only."], 403);
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'get_users') {
        try {
            $stmt = $pdo->query("
                SELECT p.*, u.is_banned 
                FROM profiles p 
                JOIN users u ON p.user_id = u.id 
                ORDER BY p.created_at DESC
            ");
            $users = $stmt->fetchAll();
            sendResponse($users);
        } catch (Exception $e) {
            sendResponse(["status" => "error", "message" => $e->getMessage()], 500);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    
    if ($action === 'update_user') {
        $profileId = $input['id'] ?? '';
        
        if (isset($input['is_banned'])) {
            try {
                $stmt = $pdo->prepare("SELECT user_id FROM profiles WHERE id = ?");
                $stmt->execute([$profileId]);
                $profile = $stmt->fetch();
                
                if ($profile) {
                    $userId = $profile['user_id'];
                    $stmt = $pdo->prepare("UPDATE users SET is_banned = ? WHERE id = ?");
                    $stmt->execute([$input['is_banned'] ? 1 : 0, $userId]);
                    sendResponse(["status" => "success"]);
                } else {
                    sendResponse(["status" => "error", "message" => "Profile not found"], 404);
                }
            } catch (Exception $e) {
                sendResponse(["status" => "error", "message" => $e->getMessage()], 500);
            }
        }
    }
}
