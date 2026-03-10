<?php
/**
 * api/profiles.php - Profile Controller
 */

require_once 'db.php';
session_start();

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'get_profile') {
        $userId = $_GET['userId'] ?? null;
        if (!$userId) sendResponse(["status" => "error", "message" => "Missing User ID"], 400);

        // Security: Ensure users can only get their own profile unless they are admin
        if (!isset($_SESSION['user_id']) || ($_SESSION['user_id'] !== $userId && $_SESSION['role'] !== 'admin')) {
            sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
        }

        $stmt = $pdo->prepare("
            SELECT p.*, u.is_banned, u.email as user_email
            FROM profiles p 
            JOIN users u ON p.user_id = u.id 
            WHERE p.user_id = ?
        ");
        $stmt->execute([$userId]);
        $profile = $stmt->fetch();

        if ($profile && !$profile['is_available'] && $profile['cooldown_end_date']) {
            if (strtotime($profile['cooldown_end_date']) <= time()) {
                $stmt = $pdo->prepare("UPDATE profiles SET is_available = 1 WHERE id = ?");
                $stmt->execute([$profile['id']]);
                $profile['is_available'] = 1;
            }
        }
        sendResponse($profile);
    }

    if ($action === 'search_donors') {
        $bloodType = $_GET['bloodType'] ?? '';
        $bloodType = str_replace(' ', '+', $bloodType);
        $cityId = $_GET['cityId'] ?? '';
        
        $query = "SELECT p.* FROM profiles p 
                  JOIN users u ON p.user_id = u.id
                  WHERE p.role = 'donor' AND u.is_banned = 0 
                  AND (p.is_available = 1 OR (p.cooldown_end_date IS NOT NULL AND p.cooldown_end_date <= CURRENT_TIMESTAMP))";
        $params = [];

        if ($bloodType) {
            $query .= " AND p.blood_type = ?";
            $params[] = $bloodType;
        }
        if ($cityId) {
            $query .= " AND p.city_id = ?";
            $params[] = $cityId;
        }

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        sendResponse($stmt->fetchAll());
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();
    if ($action === 'update_profile') {
        $profileId = $input['id'] ?? null;
        if (!$profileId) {
            sendResponse(["status" => "error", "message" => "Missing profile ID"], 400);
        }
        
        // Security: Ensure users can only update their own profile
        $stmt = $pdo->prepare("SELECT user_id FROM profiles WHERE id = ?");
        $stmt->execute([$profileId]);
        $owner = $stmt->fetch();
        
        if (!$owner || !isset($_SESSION['user_id']) || ($_SESSION['user_id'] !== $owner['user_id'] && $_SESSION['role'] !== 'admin')) {
             sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
        }

        $fields = ['name', 'phone', 'city_id', 'blood_type', 'is_available'];
        $updates = [];
        $params = [];
        
        foreach ($fields as $field) {
            if (isset($input[$field])) {
                $updates[] = "$field = ?";
                $params[] = $input[$field];
            }
        }
        
        if (!empty($updates)) {
            $params[] = $profileId;
            $stmt = $pdo->prepare("UPDATE profiles SET " . implode(', ', $updates) . " WHERE id = ?");
            $stmt->execute($params);
            sendResponse(["status" => "success"]);
        } else {
            sendResponse(["status" => "success", "message" => "No changes"]);
        }
    }
}
