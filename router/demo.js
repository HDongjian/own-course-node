const router = require('koa-router')();
const Utils = require('../utils');
const Tips = require('../utils/tip');
const db = require('../db');

router.get('/api/menu/list', async (ctx, next)=> {

})

router.post('/api/menu/add', async (ctx, next)=> {

})

router.post('/api/menu/update/:id', async (ctx, next)=> {

})

router.post('/api/menu/delect/:id', async (ctx, next)=> {
  let id = ctx.request.url.replace('/api/menu/delect/','')

})

module.exports = router;