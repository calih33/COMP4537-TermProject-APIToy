-- Demo accounts (john@john.com / 123, admin@admin.com / 111) as bcrypt hashes.

INSERT INTO users (email, password_hash, role) VALUES
    ('john@john.com',   '$2b$12$zct.E9UlgTtUHgxnVRNbLefPuAiphB24dAnmy2OcDVdHTh2CoM/lm', 'user'),
    ('admin@admin.com', '$2b$12$1ow7s.ArALMGJdADLa7l5uKFmqS27aUHx7DmtgNO3NTxH.45/Mxwe', 'admin');
