CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  type  ENUM('income', 'expense') NOT NULL
);

INSERT INTO categories (name, type) VALUES
  ('Salary',        'income'),
  ('Freelance',     'income'),
  ('Investment',    'income'),
  ('Business',      'income'),
  ('Other Income',  'income'),
  ('Food',          'expense'),
  ('Transport',     'expense'),
  ('Shopping',      'expense'),
  ('Healthcare',    'expense'),
  ('Education',     'expense'),
  ('Entertainment', 'expense'),
  ('Utilities',     'expense'),
  ('Rent',          'expense'),
  ('Other Expense', 'expense');

CREATE TABLE IF NOT EXISTS transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT            NOT NULL,
  type        ENUM('income', 'expense') NOT NULL,
  amount      DECIMAL(12, 2) NOT NULL,
  category_id INT            NOT NULL,
  description TEXT,
  date        DATE           NOT NULL,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX idx_transactions_user     ON transactions(user_id);
CREATE INDEX idx_transactions_date     ON transactions(date);
CREATE INDEX idx_transactions_type     ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category_id);