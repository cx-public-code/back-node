const mysql = require("mysql");

class Database {
  constructor(config) {
    this.connection = mysql.createConnection(config);
    this.params = [];
  }

  /**
    * @function table
    * @description 记录表名和基础sql语句
    * @param {string} name: 表名称
    * @returns {this}
  */
  table(name) {
    this.query = `SELECT * FROM ${name}`;
    this.tableName = name;
    return this;
  }

  /**
    * @function select
    * @description 查询操作
    * @param {string} columns: 查询的字段
    * @param {boolean} maxId: 获取当前表最新数据的ID
    * @param {boolean} count: 获取当前表的数据数量
    * @returns {this}
  */
  select(columns = "*", maxId = false, count = false) {
    if (count) {
      this.query = `SELECT COUNT(*) AS count FROM ${this.tableName}`;
    } else if (maxId) {
      this.query = `SELECT MAX(id) AS maxId FROM ${this.tableName}`;
    } else if (typeof columns === "string" || Array.isArray(columns)) {
      const selectedColumns = Array.isArray(columns)
        ? columns.join(",")
        : columns;
      this.query = `SELECT ${selectedColumns} FROM ${this.tableName}`;
    } else {
      this.query = `SELECT * FROM ${this.tableName}`;
    }
    return this;
  }

  /**
    * @function where
    * @description sql条件
    * @param {array} conditions: 条件数组
    * @returns {this}
  */
  where(conditions) {
    const localParams = [];
    if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
      return this;
    }

    const whereConditions = [];

    for (const condition of conditions) {
      if (!Array.isArray(condition) || condition.length !== 2) {
        continue;
      }

      const [column, value] = condition;

      if (typeof column !== "string" || value === undefined) {
        continue;
      }

      whereConditions.push(`${column} = ?`);
      localParams.push(value);
    }

    if (whereConditions.length > 0) {
      this.query += " WHERE " + whereConditions.join(" AND ");
      this.params.push(...localParams);
    }

    return this;
  }

  /**
    * @function limit
    * @description 分页
    * @param {string | number} pageSize: 每页数据量
    * @param {string | number} pageNum: 第几页
    * @returns {this}
  */
  limit(pageSize, pageNum) {
    const start = (pageNum - 1) * pageSize;
    this.query += ` LIMIT ${start}, ${pageSize}`;
    return this;
  }

  /**
    * @function insert
    * @description 新增操作
    * @param {object} data: 新增的字段对象
    * @returns {this}
  */
  insert(data) {
    const keys = Object.keys(data).join(",");
    const values = Object.values(data)
      .map((value) => `"${value}"`)
      .join(",");
    this.query = `INSERT INTO ${this.tableName} (${keys}) VALUES (${values})`;
    return this;
  }

  /**
   * @function update
   * @description 更新操作
   * @param {object} data: 更新的字段对象
   * @returns {this}
  */
  update(data) {
    const setClause = Object.entries(data)
      .map(([key, value]) => `${key}="${value}"`)
      .join(",");
    this.query = `UPDATE ${this.tableName} SET ${setClause}`;
    return this;
  }

  /**
   * @function delete
   * @description 删除操作
   * @returns {this}
  */
  delete() {
    this.query = `DELETE FROM ${this.tableName}`;
    return this;
  }

  /**
   * @function orderBy
   * @description 排序
   * @param {string} field: 要排序的字段
   * @param {string} orderType: 排序方式 asc || desc
   * @returns {this}
  */
  orderBy(field, orderType) {
    if (!field || typeof field !== "string") {
      return this;
    }

    if (!orderType || (orderType !== "asc" && orderType !== "desc")) {
      return this;
    }

    this.query += ` ORDER BY ${field} ${orderType.toUpperCase()}`;
    return this;
  }

  /**
   * @function count
   * @description 返回当前表的数据数量
   * @returns {Number}
  */
  async count() {
    this.query = `SELECT COUNT(*) AS count FROM ${this.tableName}`;
    return await this.execute().then((results) => {
      return results[0].count;
    });
  }

  /**
   * @function raw
   * @description 接收原生sql的函数(复杂的数据库操作会用到. 后续再逐渐完善...)
   * @param {string} sql: 原生sql语句
   * @returns {this}
  */
  raw(sql) {
    this.query = sql;
    return this;
  }

  /**
   * @function execute
   * @description 执行sql
   * @returns {Promise}
  */
  execute() {
    if (this.params.length === 0) {
      return new Promise((resolve, reject) => {
        this.connection.query(this.query, (error, results) => {
          if (error) {
            this.params = [];
            reject(error);
          } else {
            this.params = [];
            resolve(results);
          }
        });
      });
    } else {
      const paramsCopy = [...this.params];
      return new Promise((resolve, reject) => {
        this.connection.query(this.query, paramsCopy, (error, results) => {
          if (error) {
            this.params = [];
            reject(error);
          } else {
            this.params = [];
            resolve(results);
          }
        });
      });
    }
  }
}

module.exports = Database;
