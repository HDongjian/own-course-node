const router = require('koa-router')();
const Utils = require('../utils');
const Tips = require('../utils/tip');
const db = require('../db');

router.get('/api/exam/list', async (ctx, next) => {
  let sql = 'SELECT * FROM exam WHERE isDelect=0 order by updateTime desc';
  await db(sql).then(res => {
    Utils.handleMessage(ctx, {
      ...Tips[1000], data: res
    })
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  });
})

router.post('/api/exam/add', async (ctx, next) => {
  const data = ctx.request.body;
  let now = Utils.formatCurrentTime()
  const sql = 'SELECT * FROM exam WHERE examName=' + JSON.stringify(data.examName);
  const sqlAdd = 'INSERT INTO exam (examName, description, createTime, updateTime,isDelect) VALUES (?,?,?,?,?)';
  const sqlData = [data.examName, data.description, now, now, 0];
  let result = await db(sql).then(res => { return res })
  if (result.length == 0) {
    await db(sqlAdd, sqlData).then(() => {
      Utils.handleMessage(ctx, Tips[1001])
    }).catch((e) => {
      Utils.handleMessage(ctx, Tips[2000], e)
    });
  } else {
    Utils.handleMessage(ctx, Tips[2001])
  }
})

router.post('/api/exam/update/:id', async (ctx, next) => {
  let sql = Utils.getUpdateSql(ctx.request, 'exam', 'examId')
  await db(sql).then(results => {
    Utils.handleMessage(ctx, Tips[1003])
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})

router.post('/api/exam/delect/:id', async (ctx, next) => {
  let id = ctx.request.url.replace('/api/exam/delect/', '')
  let sql_ = 'SELECT * FROM subject WHERE isDelect=0 and examId=' + id
  let sql__ = "SELECT * FROM company WHERE isDelect=0 and INSTR(companyType,'" + id + "')>0"
  let result = await db(sql_).then(res => { return res })
  let result_ = await db(sql__).then(res => { return res })
  if (result.length > 0) {
    return Utils.handleMessage(ctx, Tips[2003])
  }
  if (result_.length > 0) {
    return Utils.handleMessage(ctx, {
      code: 300,
      message: `该考试与${result_[0].companyName}机构有绑定，不能删除`
    })
  }
  const SQL = 'UPDATE exam SET isDelect=1 WHERE examId=' + id
  await db(SQL).then(results => {
    Utils.handleMessage(ctx, Tips[1002])
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })


})

module.exports = router;