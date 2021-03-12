const router = require('koa-router')();
const Utils = require('../utils');
const Tips = require('../utils/tip');
const db = require('../db');

router.get('/api/time/list', async (ctx, next) => {
  let { userId } = ctx.state || {};
  // let { timeName } = Utils.getParams(ctx)
  let sql = 'SELECT * FROM time WHERE isDelect=0 and userId=' + userId + ' order by updateTime desc';
  await db(sql).then(res => {
    Utils.handleMessage(ctx, {
      ...Tips[1000], data: res
    })
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  });
})

router.post('/api/time/add', async (ctx, next) => {
  const data = ctx.request.body;
  let now = Utils.formatCurrentTime()
  let { userId } = ctx.state || {};
  let { timeTitle, timeType, timeRange, dayStart = '', dayEnd = '', weekDay = '', mouthDay = '', specialStart = '', specialEnd = '' } = data
  const sqlAdd = 'INSERT INTO time (timeTitle, timeType,timeRange,dayStart,dayEnd,weekDay,mouthDay, specialStart, specialEnd, createTime, updateTime,isDelect,userId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
  const sqlData = [timeTitle, timeType, timeRange, dayStart, dayEnd, weekDay, mouthDay, specialStart, specialEnd, now, now, 0, userId];
  await db(sqlAdd, sqlData).then(() => {
    Utils.handleMessage(ctx, Tips[1001])
  }).catch((e) => {
    Utils.handleMessage(ctx, Tips[2000], e)
  });
})

router.post('/api/time/update/:id', async (ctx, next) => {
  let sql = Utils.getUpdateSql(ctx.request, 'time', 'timeId')
  await db(sql).then(results => {
    Utils.handleMessage(ctx, Tips[1003])
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})

router.post('/api/time/delect/:id', async (ctx, next) => {
  let id = ctx.request.url.replace('/api/time/delect/', '')
  const SQL = 'UPDATE time SET isDelect=1 WHERE timeId=' + id
  await db(SQL).then(results => {
    Utils.handleMessage(ctx, Tips[1002])
  }).catch(e => {
    Utils.handleMessage(ctx, Tips[2000], e)
  })
})

module.exports = router;