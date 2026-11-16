CREATE TABLE users (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE api_usage (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id     INT UNSIGNED NULL,
    method      VARCHAR(10)  NOT NULL,
    endpoint    VARCHAR(255) NOT NULL,
    status_code SMALLINT UNSIGNED NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE health_events (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    event_id        CHAR(36) NOT NULL UNIQUE,
    user_id         INT UNSIGNED NOT NULL,
    max_health      INT UNSIGNED NOT NULL,
    previous_health INT UNSIGNED NOT NULL,
    current_health  INT UNSIGNED NOT NULL,
    decided_by      ENUM('ai', 'formula') NOT NULL,
    suggested_shots TINYINT UNSIGNED NOT NULL,
    reason          VARCHAR(500) NULL,
    approved_shots  TINYINT UNSIGNED NOT NULL,
    status          ENUM('queued', 'fired', 'blocked') NOT NULL DEFAULT 'queued',
    fired_at        TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
