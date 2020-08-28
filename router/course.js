const router = require('koa-router')();
const Utils = require('../utils');
const Tips = require('../utils/tip');
const db = require('../db');

router.get('/api/course/list', async (ctx, next) => {
  let { userId } = ctx.state || {};
  let data = Utils.filter(ctx.request.query, ['studentId', 'startTime', 'endTime', 'subjectId', 'companyId'])
  let { studentId, startTime, endTime, subjectId, companyId } = data
  let sql = 'select course.studentId, course.courseId, course.subjectId, course.unitPrice, course.startTime, course.endTime, student.companyId FROM course inner join student on course.studentId = student.studentId where course.isDelect=0 and course.userId=' + userId
  if (studentId) {
    sql += ' and course.studentId=' + studentId
  }
  if (companyId) {
    sql += ' and student.companyId=' + companyId
  }
  if (startTime) {
    sql += " and course.startTime>='" + startTime + "'"
  }
  if (endTime) {
    sql += " and course.endTime<='" + endTime + "'"
  }
  if (subjectId) {
    sql += ' and course.subjectId=' + subjectId
  }
  await db(sql).then(res => {
    Utils.handleMessage(ctx, {
      ...Tips[1000], data: res
    })
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  });
})

router.get('/api/course/page', async (ctx, next) => {
  let { userId } = ctx.state || {};
  let data = Utils.filter(ctx.request.query, ['pageSize', 'pageNum', 'studentId', 'startTime', 'endTime', 'companyId', 'subjectId'])
  let { studentId, pageSize, pageNum, startTime, endTime, companyId, subjectId } = data
  if (!pageSize || !pageNum) return ctx.body = Utils.handleMessage(ctx, Tips[2002])
  let sql = 'select course.studentId, course.courseId, course.subjectId, course.unitPrice, course.startTime, course.endTime, student.companyId FROM course inner join student on course.studentId = student.studentId where course.isDelect=0 and course.userId=' + userId
  let totalsql = 'select count(*) from course inner join student on course.studentId = student.studentId where course.isDelect=0 and course.userId=' + userId
  if (studentId) {
    sql += ' and course.studentId=' + studentId
    totalsql += ' and course.studentId=' + studentId
  }
  if (startTime) {
    sql += " and course.startTime>='" + startTime + "'"
    totalsql += " and course.startTime>='" + startTime + "'"
  }
  if (endTime) {
    sql += " and course.endTime<='" + endTime + "'"
    totalsql += " and course.endTime<='" + endTime + "'"
  }
  if (companyId) {
    sql += ' and student.companyId=' + companyId
    totalsql += ' and student.companyId=' + companyId
  }
  if (subjectId) {
    sql += ' and course.subjectId=' + subjectId
    totalsql += ' and course.subjectId=' + subjectId
  }
  sql += ' order by startTime desc limit ' + (pageNum - 1) * pageSize + ',' + pageSize
  let total = await db(totalsql).then(res => { return res })
  await db(sql).then(res => {
    Utils.handleMessage(ctx, {
      ...Tips[1000], data: { data: res, total: total[0] ? total[0]['count(*)'] : 0, pageNum: Number(pageNum), pageSize: Number(pageSize) }
    })
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  });
})

router.post('/api/course/add', async (ctx, next) => {
  const data = ctx.request.body;
  let now = Utils.formatCurrentTime()
  let { userId } = ctx.state || {};
  let { studentId, subjectId, unitPrice, startTime, endTime } = data
  const sql = "select * from course where isDelect=0 and not (startTime >='" + endTime + "' or endTime <='" + startTime + "');"
  // const sql = "select * from course where course.`isDelect`=0 and not (course.`startTime`>='"+ endTime +"' or course.`endTime`=<'"+ startTime +"')"
  const sqlAdd = 'INSERT INTO course (studentId,subjectId, unitPrice,startTime,endTime,createTime, updateTime, userId, isDelect) VALUES (?,?,?,?,?,?,?,?,?)';
  const sqlData = [studentId, subjectId, unitPrice, startTime, endTime, now, now, userId, '0'];
  let result = await db(sql).then(res => { return res })
  if (result.length == 0) {
    await db(sqlAdd, sqlData).then(() => {
      Utils.handleMessage(ctx, Tips[1001])
    }).catch((e) => {
      Utils.handleMessage(ctx, Tips[2000], e)
    });
  } else {
    Utils.handleMessage(ctx, Tips[4000])
  }
})

router.post('/api/course/update', async (ctx, next) => {
  const data = ctx.request.body;
  let { startTime, endTime, id } = data
  const sql = "select * from course where isDelect=0 and not courseId=" + id + " and not (startTime >='" + endTime + "' or endTime <='" + startTime + "');"
  let result = await db(sql).then(res => { return res })
  let sqlUp = Utils.getUpdateSql(ctx.request, 'course', 'courseId')
  if (result.length == 0) {
    await db(sqlUp).then(results => {
      Utils.handleMessage(ctx, Tips[1003])
    }).catch(e => {
      Utils.handleMessage(ctx, Tips[2000], e)
    })
  } else {
    Utils.handleMessage(ctx, { ...Tips[4000], data: result[0] })
  }
})

router.post('/api/course/delect/:id', async (ctx, next) => {
  let id = ctx.request.url.replace('/api/course/delect/', '')
  const SQL = 'UPDATE course SET isDelect=1 WHERE courseId=' + id
  await db(SQL).then(results => {
    Utils.handleMessage(ctx, Tips[1002])
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})


router.get('/api/course/download', async (ctx, next) => {

  let { userId } = ctx.state || {};
  let data = Utils.filter(ctx.request.query, ['studentId', 'startTime', 'endTime', 'subjectId', 'companyId'])
  let { studentId, startTime, endTime, subjectId, companyId } = data
  let sql = 'select student.studentName, course.subjectId, course.unitPrice, course.startTime, course.endTime, student.companyId FROM course inner join student on course.studentId = student.studentId  where course.isDelect=0 and course.userId=' + userId
  if (studentId) {
    sql += ' and course.studentId=' + studentId
  }
  if (companyId) {
    sql += ' and student.companyId=' + companyId
  }
  if (startTime) {
    sql += " and course.startTime>='" + startTime + "'"
  }
  if (endTime) {
    sql += " and course.endTime<='" + endTime + "'"
  }
  if (subjectId) {
    sql += ' and course.subjectId=' + subjectId
  }
  let company = 'SELECT * FROM company WHERE isDelect=0 and userId=' + userId;
  let subject = 'SELECT * FROM subject WHERE isDelect=0';

  let companyData = await db(company).then(res => { return res })
  let subjecData = await db(subject).then(res => { return res })
  let companyObj = {}
  let subjectObj = {}
  for (let i = 0; i < companyData.length; i++) {
    companyObj[companyData[i].companyId] = companyData[i].companyName
  }
  for (let i = 0; i < subjecData.length; i++) {
    subjectObj[subjecData[i].subjectId] = subjecData[i].subjectName
  }

  let courseData = await db(sql).then(res => { return res })
  let conf = {};
  conf.name = "total";
  let alldata = new Array();
  let dealData = courseData.map((item, i) => {
    return {
      index: i + 1,
      studentName: item.studentName,
      companyName: companyObj[item.companyId],
      subjectName: subjectObj[item.subjectId],
      startTime: Utils.myMoment(item.startTime).formate('YYYY-MM-DD HH:mm'),
      endTime: Utils.myMoment(item.endTime).formate('YYYY-MM-DD HH:mm'),
      timeLong: Utils.getMinutes(item.startTime, item.endTime),
      unitPrice: item.unitPrice,
    }
  })
  for (const item of dealData) {
    alldata.push([item.index, item.studentName, item.companyName, item.subjectName, item.startTime, item.endTime, item.timeLong, item.unitPrice])
  }
  //决定列名和类型
  conf.cols = [
    { caption: '序号', type: 'number', width: 10 },
    { caption: '学生姓名', type: 'string', width: 12 },
    { caption: '所在机构', type: 'string', width: 12 },
    { caption: '科目', type: 'string', width: 12 },
    { caption: '上课时间', type: 'string', width: 18 },
    { caption: '下课时间', type: 'string', width: 18 },
    { caption: '课程时长(分钟)', type: 'number', width: 20 },
    { caption: '课时费', type: 'number', width: 20 }
  ];
  conf.rows = alldata;
  let name = `total(${Utils.myMoment(startTime).formate('YYYY-MM-DD')}-${Utils.myMoment(endTime).formate('YYYY-MM-DD')})`
  await Utils.exportdata(conf, ctx, name);
})


module.exports = router;