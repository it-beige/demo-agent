import 'dotenv/config'

export const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
}

// 建表语句集合
export const TABLE_SCHEMA = {
  FRIENDS: `
    CREATE TABLE IF NOT EXISTS friends (
      id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
      name VARCHAR(50) NOT NULL COMMENT '姓名',
      gender VARCHAR(10) DEFAULT NULL COMMENT '性别（男/女）',
      birth_date DATE DEFAULT NULL COMMENT '出生日期',
      company VARCHAR(100) DEFAULT NULL COMMENT '公司名称',
      title VARCHAR(100) DEFAULT NULL COMMENT '职位/头衔',
      phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
      wechat VARCHAR(50) DEFAULT NULL COMMENT '微信号',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='好友信息表';
  `,
}

// 批量插入好友信息（配合 mysql2 的 query(sql, [values]) 批量写入，VALUES ? 由驱动展开）
export const INSERT_FRIENDS_SQL = `
  INSERT INTO friends (name, gender, birth_date, company, title, phone, wechat)
  VALUES ?
`
