const router = require('koa-router')();
const Utils = require('../utils');
const Tips = require('../utils/tip');
const db = require('../db');

router.get('/api/statistics/total',
 async (ctx, next) => {
  let { userId } = ctx.state || {};
  let order = 'SELECT classCount,orderAmount FROM orders WHERE isDelect=0 and userId=' + userId;
  let student = 'select count(*) from student where isDelect=0 and userId=' + userId;
  let course = 'select endTime,startTime,unitPrice from course where isDelect=0 and userId=' + userId;
  let orderRes = await db(order).then(res => { return res })
  let studentRes = await db(student).then(res => { return res })
  let courseRes = await db(course).then(res => { return res })
  let orderTotal = 0;let orderAmount = 0;let courseTotal = 0;let totalUnitPrice = 0
  for (const item of orderRes) {
    orderTotal++
    orderAmount+=Number(item.orderAmount||0)
  }
  for (const item of courseRes) {
    let second = new Date(item.endTime).getTime() - new Date(item.startTime).getTime()
    courseTotal +=second
    totalUnitPrice+=Number(item.unitPrice||0)
  }
  courseTotal = parseInt(courseTotal / 1000 / 60 / 60)
  Utils.handleMessage(ctx, {
    ...Tips[1000], data: {
    '学生总数':studentRes[0]['count(*)'],
    '订单总数':orderTotal,
    '订单总金额':orderAmount,
    '课时总数':courseTotal,
    "课时总金额":totalUnitPrice,
    '课时单价':parseInt(totalUnitPrice/courseTotal),
    }
  })
})

module.exports = router;
