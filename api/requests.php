<?php
/**
 * api/requests.php - Donation Request Controller
 */

require_once 'db.php';
session_start();

$action = $_GET['action'] ?? '';
$input = getJsonInput();

if (!isset($_SESSION['user_id'])) {
    sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'get_requests') {
        $profileId = $_GET['profileId'] ?? null;
        $role = $_GET['role'] ?? ''; 
        
        if (!$profileId) sendResponse(["status" => "error", "message" => "Missing profileId"], 400);

        // Security check
        $stmt = $pdo->prepare("SELECT user_id FROM profiles WHERE id = ?");
        $stmt->execute([$profileId]);
        $owner = $stmt->fetch();
        if (!$owner || ($_SESSION['user_id'] !== $owner['user_id'] && $_SESSION['role'] !== 'admin')) {
             sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
        }

        $column = ($role === 'donor') ? 'donor_id' : 'requester_id';
        $other_table = ($role === 'donor') ? 'requester_id' : 'donor_id';

        try {
            $stmt = $pdo->prepare("
                SELECT r.*, p.name as other_name, p.phone as other_phone, p.email as other_email, p.blood_type as other_blood_type
                FROM donation_requests r
                JOIN profiles p ON r.$other_table = p.id
                WHERE r.$column = ?
                ORDER BY r.created_at DESC
            ");
            $stmt->execute([$profileId]);
            sendResponse($stmt->fetchAll());
        } catch (Exception $e) {
            sendResponse(["status" => "error", "message" => $e->getMessage()], 500);
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($action === 'create_request') {
        $requester_id = $input['requester_id'] ?? null;
        $donor_id = $input['donor_id'] ?? null;
        $message = htmlspecialchars($input['message'] ?? '', ENT_QUOTES, 'UTF-8');

        if (!$requester_id || !$donor_id) sendResponse(["status" => "error", "message" => "Missing IDs"], 400);

        // Security check
        $stmt = $pdo->prepare("SELECT user_id FROM profiles WHERE id = ?");
        $stmt->execute([$requester_id]);
        $owner = $stmt->fetch();
        if (!$owner || $_SESSION['user_id'] !== $owner['user_id']) {
            sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
        }

        try {
            $pdo->beginTransaction();

            $id = generateUUID();
            $stmt = $pdo->prepare("INSERT INTO donation_requests (id, requester_id, donor_id, message) VALUES (?, ?, ?, ?)");
            $stmt->execute([$id, $requester_id, $donor_id, $message]);

            // Notify donor via database notification
            $notif_id = generateUUID();
            $stmt = $pdo->prepare("INSERT INTO notifications (id, user_id, title_ar, title_en, message_ar, message_en, type, related_request_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $notif_id, $donor_id, 'طلب دم جديد', 'New Blood Request',
                'لديك طلب جديد - أنقذ حياة!', 'You have a new request – save a life!',
                'request', $id
            ]);

            $pdo->commit();
            sendResponse(["status" => "success", "id" => $id]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            sendResponse(["status" => "error", "message" => $e->getMessage()], 500);
        }
    }

    if ($action === 'accept_request') {
        $requestId = $input['id'] ?? null;
        $donorId   = $input['donor_id'] ?? null;

        if (!$requestId || !$donorId) sendResponse(["status" => "error", "message" => "Missing IDs"], 400);

        // Security check
        $stmt = $pdo->prepare("SELECT user_id FROM profiles WHERE id = ?");
        $stmt->execute([$donorId]);
        $owner = $stmt->fetch();
        if (!$owner || $_SESSION['user_id'] !== $owner['user_id']) {
            sendResponse(["status" => "error", "message" => "Unauthorized"], 401);
        }

        try {
            $pdo->beginTransaction();
            
            $stmt = $pdo->prepare("SELECT status, requester_id FROM donation_requests WHERE id = ? FOR UPDATE");
            $stmt->execute([$requestId]);
            $req = $stmt->fetch();

            if (!$req || $req['status'] !== 'pending') {
                $pdo->rollBack();
                sendResponse(["status" => "error", "message" => "Request not available"], 400);
            }

            $stmt = $pdo->prepare("UPDATE donation_requests SET status = 'accepted' WHERE id = ?");
            $stmt->execute([$requestId]);

            // Set donor cooldown (90 days)
            $cooldown = date('Y-m-d H:i:s', strtotime('+90 days'));
            $stmt = $pdo->prepare("UPDATE profiles SET is_available = 0, cooldown_end_date = ? WHERE id = ?");
            $stmt->execute([$cooldown, $donorId]);

            $pdo->commit();
            sendResponse(["status" => "success"]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            sendResponse(["status" => "error", "message" => $e->getMessage()], 500);
        }
    }
}