-- ============================================================
-- Idea Graveyard Database Schema
-- Database: idea_graveyard_db
-- ============================================================

-- Database handled by connection config

-- ============================================================
-- TABLE: USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS USERS (
    user_id       INT            PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(50)    NOT NULL,
    email         VARCHAR(100)   UNIQUE NOT NULL,
    password_hash VARCHAR(255)   NOT NULL,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: FAILURE_CATEGORIES
-- (Created before IDEAS so IDEA_FAILURE_MAP FK works)
-- ============================================================
CREATE TABLE IF NOT EXISTS FAILURE_CATEGORIES (
    category_id   INT            PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(50)    NOT NULL UNIQUE,
    description   TEXT
);

-- ============================================================
-- TABLE: IDEAS
-- ============================================================
CREATE TABLE IF NOT EXISTS IDEAS (
    idea_id              INT            PRIMARY KEY AUTO_INCREMENT,
    title                VARCHAR(100)   NOT NULL,
    short_description    TEXT,
    detailed_postmortem  TEXT,
    industry_domain      VARCHAR(50),
    posted_by            INT,
    is_anonymous         BOOLEAN        DEFAULT FALSE,
    created_at           TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ideas_user
        FOREIGN KEY (posted_by) REFERENCES USERS(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_ideas_domain (industry_domain),
    INDEX idx_ideas_posted_by (posted_by)
);

-- ============================================================
-- TABLE: IDEA_FAILURE_MAP (Junction Table – Many-to-Many)
-- ============================================================
CREATE TABLE IF NOT EXISTS IDEA_FAILURE_MAP (
    id          INT  PRIMARY KEY AUTO_INCREMENT,
    idea_id     INT  NOT NULL,
    category_id INT  NOT NULL,
    CONSTRAINT fk_ifm_idea
        FOREIGN KEY (idea_id) REFERENCES IDEAS(idea_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_ifm_category
        FOREIGN KEY (category_id) REFERENCES FAILURE_CATEGORIES(category_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    UNIQUE KEY unique_idea_category (idea_id, category_id),
    INDEX idx_ifm_idea (idea_id),
    INDEX idx_ifm_category (category_id)
);

-- ============================================================
-- TABLE: FEEDBACK
-- ============================================================
CREATE TABLE IF NOT EXISTS FEEDBACK (
    feedback_id  INT      PRIMARY KEY AUTO_INCREMENT,
    idea_id      INT      NOT NULL,
    posted_by    INT,
    comment_text TEXT     NOT NULL,
    is_anonymous BOOLEAN  DEFAULT FALSE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_idea
        FOREIGN KEY (idea_id) REFERENCES IDEAS(idea_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_feedback_user
        FOREIGN KEY (posted_by) REFERENCES USERS(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    INDEX idx_feedback_idea (idea_id)
);
