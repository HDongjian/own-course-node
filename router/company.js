const router = require('koa-router')();
const Utils = require('../utils');
const Tips = require('../utils/tip');
const db = require('../db');

router.get('/api/company/list', async (ctx, next)=> {
  let { userId } = ctx.state || {};
  // let { companyName } = Utils.getParams(ctx)
  let sql = 'SELECT * FROM company WHERE isDelect=0 and userId='+userId+' order by updateTime desc';
  await db(sql).then(res => {
    Utils.handleMessage(ctx,{
      ...Tips[1000], data:res
    })
  }).catch(e => {
    Utils.handleMessage(ctx,Tips[2000],e)
  });
})

router.post('/api/company/add', async (ctx, next)=> {
  const data = ctx.request.body;
  let now = Utils.formatCurrentTime()
  let { userId } = ctx.state || {};
  let {companyName, companyType,address,wageMax,wageMin,onlineType,onlineChannel, offlineAddress, contactName, mobile, payrollDate} = data
  const sql = 'SELECT * FROM company WHERE isDelect=0 and companyName=' + JSON.stringify(data.companyName);
  const sqlAdd = 'INSERT INTO company (companyName, companyType,address,wageMax,wageMin,onlineType,onlineChannel, offlineAddress, contactName, mobile, payrollDate, createTime, updateTime,isDelect,userId,description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
  const sqlData= [companyName, companyType,address,wageMax,wageMin,onlineType,onlineChannel||'', offlineAddress||'', contactName, mobile, payrollDate, now, now,0,userId,data.description||''];
  let result = await db(sql).then(res => { return res})
  if (result.length == 0) {
    await db(sqlAdd, sqlData).then(() => {
      Utils.handleMessage(ctx,Tips[1001])
    }).catch((e) => {
      Utils.handleMessage(ctx,Tips[2000],e)
    });
  } else {
    Utils.handleMessage(ctx,Tips[2001])
  }
})

router.post('/api/company/update/:id', async (ctx, next)=> {
  let sql = Utils.getUpdateSql(ctx.request,'company','companyId')
  await db(sql).then(results => {
    Utils.handleMessage(ctx,Tips[1003])
  }).catch(e => {
    Utils.handleMessage(ctx,Tips[2000],e)
  })
})

router.post('/api/company/delect/:id', async (ctx, next)=> {
  let id = ctx.request.url.replace('/api/company/delect/','')
  let sql__ = "SELECT * FROM student WHERE isDelect=0 and companyId =" + id
  let result_ = await db(sql__).then(res => { return res })
  if (result_.length > 0) {
    return Utils.handleMessage(ctx, {
      code: 300,
      message: `该机构下有${result_[0].studentName}学生，不能删除`
    })
  }
  const SQL = 'UPDATE company SET isDelect=1 WHERE companyId=' + id  
  await db(SQL).then(results => {
    Utils.handleMessage(ctx,Tips[1002])
  }).catch(e => {
    Utils.handleMessage(ctx,Tips[2000],e)
  })
})

module.exports = router;