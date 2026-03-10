<?php
/**
 * api/core/Config.php
 */

class Config {
    private static $config = [];

    public static function load() {
        $envFile = __DIR__ . '/../../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || strpos($line, '#') === 0) continue;
                if (strpos($line, '=') === false) continue;
                
                list($name, $value) = explode('=', $line, 2);
                self::$config[trim($name)] = trim($value);
            }
        }
        
        // SMTP Config from api/config.php (Migration)
        if (file_exists(__DIR__ . '/../config.php')) {
            require_once __DIR__ . '/../config.php';
            self::$config['SMTP_HOST'] = defined('SMTP_HOST') ? SMTP_HOST : '';
            self::$config['SMTP_PORT'] = defined('SMTP_PORT') ? SMTP_PORT : '';
            self::$config['SMTP_USER'] = defined('SMTP_USER') ? SMTP_USER : '';
            self::$config['SMTP_PASS'] = defined('SMTP_PASS') ? SMTP_PASS : '';
            self::$config['SMTP_FROM_EMAIL'] = defined('SMTP_FROM_EMAIL') ? SMTP_FROM_EMAIL : '';
            self::$config['SMTP_FROM_NAME'] = defined('SMTP_FROM_NAME') ? SMTP_FROM_NAME : '';
        }
    }

    public static function get($key, $default = null) {
        if (empty(self::$config)) self::load();
        return self::$config[$key] ?? $default;
    }
}
