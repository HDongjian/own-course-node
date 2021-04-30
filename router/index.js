const user = require('./user');
const menu = require('./menu');
const role = require('./role');
const exam = require('./exam');
const subject = require('./subject');
const student = require('./student');
const company = require('./company');
const time = require('./time');
const course = require('./course');
const uploader = require('./uploader');
const order = require('./order');
const statistics = require('./statistics');
module.exports = function (app) {
  app.use(user.routes()).use(user.allowedMethods());
  app.use(menu.routes()).use(menu.allowedMethods());
  app.use(role.routes()).use(role.allowedMethods());
  app.use(exam.routes()).use(exam.allowedMethods());
  app.use(subject.routes()).use(subject.allowedMethods());
  app.use(student.routes()).use(student.allowedMethods());
  app.use(company.routes()).use(company.allowedMethods());
  app.use(time.routes()).use(time.allowedMethods());
  app.use(course.routes()).use(course.allowedMethods());
  app.use(uploader.routes()).use(uploader.allowedMethods());
  app.use(order.routes()).use(order.allowedMethods());
  app.use(statistics.routes()).use(statistics.allowedMethods());
}