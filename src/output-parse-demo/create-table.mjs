import mysql from 'mysql2/promise'
import {
  connectionConfig,
  TABLE_SCHEMA,
  INSERT_FRIENDS_SQL,
} from './constant.mjs'

async function main() {
  const connection = await mysql.createConnection(connectionConfig)

  try {
    // 创建好友表
    await connection.query(TABLE_SCHEMA.FRIENDS)

    // 插入 demo 数据（批量插入）
    const insertSql = INSERT_FRIENDS_SQL

    const values = [
      [
        '王经理', // name
        '男', // gender
        '1990-01-01', // birth_date
        '字节跳动', // company
        '产品经理/产品总监', // title
        '18612345678', // phone
        'wangjingli2024', // wechat
      ],
      [
        '李总监',
        '女',
        '1985-05-15',
        '阿里巴巴',
        '技术总监',
        '13987654321',
        'lizongjian',
      ],
    ]

    await connection.beginTransaction()
    const [result] = await connection.query(insertSql, [values])
    await connection.commit()
    console.log(
      `成功创建数据库和表，并插入 demo 数据，插入${result.affectedRows}行数据：`,
    )
  } catch (err) {
    console.error('执行出错：', err)
    await connection.rollback() // 任何一步失败，全部回滚
  } finally {
    await connection.end()
  }
}

main().catch(err => {
  console.error('脚本运行失败：', err)
})
