import 'dotenv/config'

export const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
}

export const TABLE_SCHEMA = {
  FRIENDS: `
    CREATE TABLE IF NOT EXISTS friends (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      gender VARCHAR(10),
      birth_date DATE,
      company VARCHAR(100),
      title VARCHAR(100),
      phone VARCHAR(20),
      wechat VARCHAR(50)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `,
}

export const INSERT_FRIENDS_SQL = `
  INSERT INTO friends (
    name,
    gender,
    birth_date,
    company,
    title,
    phone,
    wechat
  ) VALUES ?;
`
