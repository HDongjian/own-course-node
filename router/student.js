const router = require('koa-router')();
const Utils = require('../utils');
const Tips = require('../utils/tip');
const db = require('../db');

router.get('/api/student/list', async (ctx, next) => {
  let { userId } = ctx.state || {};
  let data = Utils.filter(ctx.request.query, ['status', 'companyId'])
  let { status, companyId } = data
  let sql = 'SELECT * FROM student WHERE isDelect=0 and userId=' + userId;
  if (companyId) {
    sql += ' and companyId=' + companyId
  }
  if (status) {
    sql += ' and status=' + status
  }
  await db(sql).then(res => {
    Utils.handleMessage(ctx, {
      ...Tips[1000], data: res
    })
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  });
})

router.get('/api/student/page', async (ctx, next) => {
  let { userId } = ctx.state || {};
  let data = Utils.filter(ctx.request.query, ['pageSize', 'pageNum', 'studentId', 'startTime', 'endTime', 'companyId', 'status'])
  let { studentId, pageSize, pageNum, startTime, endTime, companyId, status } = data
  let sql = 'SELECT * FROM student WHERE isDelect=0 and userId=' + userId;
  let totalsql = 'select count(*) from student where isDelect=0 and userId=' + userId;

  if (studentId) {
    sql += ' and studentId=' + studentId
    totalsql += ' and studentId=' + studentId
  }
  if (companyId) {
    sql += ' and companyId=' + companyId
    totalsql += ' and companyId=' + companyId
  }
  if (status) {
    sql += ' and status=' + status
    totalsql += ' and status=' + status
  }
  sql += ' order by updateTime desc limit ' + (pageNum - 1) * pageSize + ',' + pageSize
  let total = await db(totalsql).then(res => { return res })
  await db(sql).then(res => {
    Utils.handleMessage(ctx, {
      ...Tips[1000], data: { data: res, total: total[0] ? total[0]['count(*)'] : 0, pageNum: Number(pageNum), pageSize: Number(pageSize) }
    })
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  });
})

router.post('/api/student/add', async (ctx, next) => {
  const data = ctx.request.body;
  let now = Utils.formatCurrentTime()
  let { userId } = ctx.state || {};
  let { studentName, subjectIds, companyId, targetScore = '', currentScore = '', gradeList = '', perHourPay, description = '' } = data
  const sql = 'SELECT * FROM student WHERE isDelect=0 and studentName=' + JSON.stringify(data.studentName);
  const sqlAdd = 'INSERT INTO student (studentName, subjectIds,companyId,targetScore,currentScore,gradeList,perHourPay, createTime, updateTime,isDelect,userId,description,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
  const sqlData = [studentName, subjectIds, companyId, targetScore, currentScore, gradeList, perHourPay, now, now, 0, userId, description, '1'];
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

router.post('/api/student/update/:id', async (ctx, next) => {
  let sql = Utils.getUpdateSql(ctx.request, 'student', 'studentId')
  await db(sql).then(results => {
    Utils.handleMessage(ctx, Tips[1003])
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})

router.post('/api/student/delect/:id', async (ctx, next) => {
  let id = ctx.request.url.replace('/api/student/delect/', '')
  let sql__ = "SELECT * FROM course WHERE isDelect=0 and studentId =" + id
  let result_ = await db(sql__).then(res => { return res })
  if (result_.length > 0) {
    return Utils.handleMessage(ctx, {
      code: 300,
      message: `该学生有课程，不能删除`
    })
  }
  const SQL = 'UPDATE student SET isDelect=1 WHERE studentId=' + id
  await db(SQL).then(results => {
    Utils.handleMessage(ctx, Tips[1002])
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})

router.post('/api/student/status', async (ctx, next) => {
  let data = Utils.filter(ctx.request.body, ['studentId', 'status']);
  const SQL = 'UPDATE student SET status=' + data.status + ' WHERE studentId=' + data.studentId
  await db(SQL).then(results => {
    Utils.handleMessage(ctx, Tips[1002])
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})

module.exports = router;