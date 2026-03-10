<?php
/**
 * api/auth.php - Authentication Controller
 */

require_once 'db.php';

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error.log');

if (session_status() === PHP_SESSION_NONE) {
    session_start([
        'cookie_httponly' => true,
        'cookie_secure' => isset($_SERVER['HTTPS']),
        'cookie_samesite' => 'Lax',
    ]);
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = getJsonInput();

    if ($action === 'signup') {
        $email = trim($input['email'] ?? '');
        $password_raw = $input['password'] ?? '';
        
        if (empty($email) || strlen($password_raw) < 4) {
             sendResponse(["status" => "error", "message" => "Invalid email or password"], 400);
        }

        $password = password_hash($password_raw, PASSWORD_BCRYPT);
        $metadata = $input['metadata'] ?? [];
        
        $userId = generateUUID();
        $profileId = generateUUID();

        try {
            $pdo->beginTransaction();

            $stmt = $pdo->prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $email, $password]);

            $stmt = $pdo->prepare("INSERT INTO profiles (id, user_id, name, phone, email, city_id, role, blood_type, nni) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $profileId,
                $userId,
                $metadata['name'] ?? '',
                $metadata['phone'] ?? '',
                $email,
                $metadata['city_id'] ?? null,
                $metadata['role'] ?? 'donor',
                $metadata['blood_type'] ?? null,
                $metadata['nni'] ?? null
            ]);

            $stmt = $pdo->prepare("SELECT * FROM profiles WHERE id = ?");
            $stmt->execute([$profileId]);
            $profile = $stmt->fetch();

            $pdo->commit();
            
            $_SESSION['user_id'] = $userId;
            $_SESSION['role'] = $profile['role'];

            sendResponse([
                "status" => "success", 
                "user" => ["id" => $userId, "email" => $email],
                "profile" => $profile
            ]);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            sendResponse(["status" => "error", "message" => $e->getMessage()], 400);
        }
    }

    if ($action === 'signin') {
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';

        if (empty($email) || empty($password)) {
            sendResponse(["status" => "error", "message" => "Email and password are required"], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user) {
            $isCorrectPassword = false;
            $shouldUpgradeHash = false;

            if (password_verify($password, $user['password_hash'])) {
                $isCorrectPassword = true;
                // Check if we should upgrade the cost if it's already BCrypt
                if (password_needs_rehash($user['password_hash'], PASSWORD_BCRYPT)) {
                    $shouldUpgradeHash = true;
                }
            } elseif (md5($password) === $user['password_hash'] || $password === $user['password_hash'] /* extreme fallback for very old cleartext */) {
                $isCorrectPassword = true;
                $shouldUpgradeHash = true;
            }

            if ($isCorrectPassword) {
                // Handle upgrade
                if ($shouldUpgradeHash) {
                    $newHash = password_hash($password, PASSWORD_BCRYPT);
                    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
                    $stmt->execute([$newHash, $user['id']]);
                }

                if (isset($user['is_banned']) && $user['is_banned']) {
                    sendResponse(["status" => "error", "message" => "Your account has been banned. Please contact support."], 403);
                }

                $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
                $stmt->execute([$user['id']]);
                $profile = $stmt->fetch();
                
                if (!$profile) {
                    // Critical failure for existing users - profile must exist
                    // Let's create a minimal profile if missing to "fix" it, as requested
                    $profileId = generateUUID();
                    $stmt = $pdo->prepare("INSERT INTO profiles (id, user_id, name, email, role, phone) VALUES (?, ?, ?, ?, ?, ?)");
                    $stmt->execute([$profileId, $user['id'], explode('@', $user['email'])[0], $user['email'], 'donor', '00000000']);
                    
                    // Fetch it again
                    $stmt = $pdo->prepare("SELECT * FROM profiles WHERE id = ?");
                    $stmt->execute([$profileId]);
                    $profile = $stmt->fetch();
                }
                
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['role'] = $profile['role'];
                
                sendResponse([
                    "status" => "success", 
                    "user" => ["id" => $user['id'], "email" => $user['email']],
                    "profile" => $profile
                ]);
            } else {
                sendResponse(["status" => "error", "message" => "Invalid email or password"], 401);
            }
        } else {
            sendResponse(["status" => "error", "message" => "Invalid email or password"], 401);
        }
    }

    if ($action === 'signout') {
        session_destroy();
        sendResponse(["status" => "success"]);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($action === 'check_session') {
        if (isset($_SESSION['user_id'])) {
             // Fetch full profile
             $stmt = $pdo->prepare("SELECT * FROM profiles WHERE user_id = ?");
             $stmt->execute([$_SESSION['user_id']]);
             $profile = $stmt->fetch();
             
             $stmt = $pdo->prepare("SELECT email FROM users WHERE id = ?");
             $stmt->execute([$_SESSION['user_id']]);
             $user = $stmt->fetch();

             sendResponse([
                 "status" => "success",
                 "user" => ["id" => $_SESSION['user_id'], "email" => $user['email'] ?? ''],
                 "profile" => $profile
             ]);
        } else {
            sendResponse(["status" => "error", "message" => "No active session"], 401);
        }
    }
}
