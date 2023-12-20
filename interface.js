// 数据库导入、配置
const myDb = require("./myDb")

const DB = new myDb({
  connectionLimit: 10,
  multipleStatements: true,
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'mysql'
})

// 响应码
const RES_CODE = {
  200: "OK",
  210: "Success",
  400: "Request error",
  401: "Token is invalid, please log in again",
  403: "No permission yet",
  404: "Not found",
  409: "User already exists",
  410: "User does not exist",
  411: "Id already exists",
  412: "Id does not exist",
  413: "Missing required parameters",
  415: "Field does not exist",
  416: "Wrong user name or password",
  500: "Server error, please try again later",
  510: "Failed, please try again later",
};

// Public response
function publicResponse({
  res,
  code = 200,
  data = null,
  msg = "",
  err = null,
}) {
  if (err) console.log("error: ", err)
  let returnData = {
    code,
    msg: msg ? msg : RES_CODE[code],
    data,
  }
  res.write(JSON.stringify(returnData))
  res.end()
}

// Insert
async function insertFunc(req, res) {
  let params = req.body;
  let insertData = {
    username: params.username,
    password: params.password,
  }
  await DB.table("user_list").insert(insertData).execute().then(() => {
    publicResponse({ res, code: 200 })
  }).catch((err) => { })
}

// Delete
async function deleteFunc(req, res) {
  let params = req.body
  let whereArr = [["id", "=", params.id]]

  await DB.table("goods_list").where(whereArr).execute().then((result) => {
    publicResponse({ res, code: 200 })
  }).catch((err) => { })
}

// Update
async function updateFunc(req, res) {
  let params = req.body
  let whereArr = [["id", "=", params.id]]

  await DB.table("ip_list").where(whereArr).update().execute().then(() => {
    publicResponse({ res, code: 200 })
  })
}

// Select
async function selectFunc(req, res) {
  let list = []

  await DB.table("goods_list").select().orderBy("carate_at", "desc").execute().then((result) => {
    if (result.length) {
      list = result
    }

    publicResponse({ res, code: 200, data: { list } })
  }).catch((err) => { })
}


// Test get
function testGet(req, res) {
  let params = req.query
  // ...
}

module.exports = {
  insertFunc,
  deleteFunc,
  updateFunc,
  selectFunc,
  testGet,
};
