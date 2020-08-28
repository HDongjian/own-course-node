const router = require('koa-router')();
const Utils = require('../utils');
const Tips = require('../utils/tip');
const db = require('../db');

router.get('/api/subject/list', async (ctx, next) => {
  let sql = 'SELECT * FROM subject WHERE isDelect=0 order by updateTime desc';
  await db(sql).then(res => {
    Utils.handleMessage(ctx, {
      ...Tips[1000], data: res
    })
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  });
})

router.post('/api/subject/add', async (ctx, next) => {
  const data = ctx.request.body;
  let now = Utils.formatCurrentTime()
  const sql = 'SELECT * FROM subject WHERE subjectName=' + JSON.stringify(data.subjectName);
  const sqlAdd = 'INSERT INTO subject (subjectName, examId, description, createTime, updateTime,isDelect) VALUES (?,?,?,?,?,?)';
  const sqlData = [data.subjectName, data.examId || '', data.description, now, now, 0];
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

router.post('/api/subject/update/:id', async (ctx, next) => {
  let sql = Utils.getUpdateSql(ctx.request, 'subject', 'subjectId')
  await db(sql).then(results => {
    Utils.handleMessage(ctx, Tips[1003])
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})

router.post('/api/subject/delect/:id', async (ctx, next) => {
  let id = ctx.request.url.replace('/api/subject/delect/', '')
  let sql__ = "SELECT * FROM student WHERE isDelect=0 and INSTR(subjectIds,'" + id + "')>0"
  let result_ = await db(sql__).then(res => { return res })
  if (result_.length > 0) {
    return Utils.handleMessage(ctx, {
      code: 300,
      message: `该科目与${result_[0].studentName}学生有绑定，不能删除`
    })
  }
  const SQL = 'UPDATE subject SET isDelect=1 WHERE subjectId=' + id
  await db(SQL).then(results => {
    Utils.handleMessage(ctx, Tips[1002])
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})

router.get('/api/subject/byExamIds', async (ctx, next) => {
  let { examIds } = Utils.getParams(ctx)
  if (!examIds) return ctx.body = Utils.handleMessage(ctx, Tips[2002])
  let sql = 'select * from subject where examId in (' + examIds + ')'
  await db(sql).then(res => {
    Utils.handleMessage(ctx, {
      ...Tips[1000], data: res
    })
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})

router.get('/api/subject/byIds', async (ctx, next) => {
  let { subjectIds } = Utils.getParams(ctx)
  if (!subjectIds) return ctx.body = Utils.handleMessage(ctx, Tips[2002])
  let sql = 'select * from subject where subjectId in (' + subjectIds + ')'
  await db(sql).then(res => {
    Utils.handleMessage(ctx, {
      ...Tips[1000], data: res
    })
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})

module.exports = router;