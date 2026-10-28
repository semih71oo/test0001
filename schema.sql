-- DOSYA: schema.sql (proje kokune ekle). Canli D1 veritabanindan birebir alindi.
CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, email TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')), is_admin INTEGER NOT NULL DEFAULT 0, password_hash TEXT, created_at TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member', display_name TEXT, is_suspended INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS activation_codes (member_id TEXT PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE, code_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, used_at INTEGER);
CREATE TABLE IF NOT EXISTS reset_tokens (token_hash TEXT PRIMARY KEY, member_id TEXT NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS posts (id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, author_id TEXT, member_id TEXT);
CREATE TABLE IF NOT EXISTS post_images (post_id TEXT PRIMARY KEY, mime TEXT NOT NULL, data TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS post_likes (post_id TEXT NOT NULL, voter TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (post_id, voter));
CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, post_id TEXT NOT NULL, member_id TEXT NOT NULL, body TEXT NOT NULL, ip_hash TEXT NOT NULL, created_at INTEGER NOT NULL, edited_at INTEGER DEFAULT NULL);
CREATE TABLE IF NOT EXISTS comment_history (id INTEGER PRIMARY KEY AUTOINCREMENT, comment_id TEXT NOT NULL, member_id TEXT NOT NULL, old_body TEXT NOT NULL, edited_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS bans (id TEXT PRIMARY KEY, kind TEXT NOT NULL, member_id TEXT, ip_hash TEXT, expires_at INTEGER, reason TEXT, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS developers (id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS site_updates (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_bans_ip ON bans(kind, ip_hash);
CREATE INDEX IF NOT EXISTS idx_bans_member ON bans(kind, member_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at);
CREATE INDEX IF NOT EXISTS idx_comment_history_comment ON comment_history(comment_id, edited_at);
