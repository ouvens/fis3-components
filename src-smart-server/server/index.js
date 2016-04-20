'use strict';

const http = require('http');

const koa = require('koa');
const logger = require('koa-logger');
const route = require('koa-route');
const serve = require('koa-static');
const stylus = require('koa-stylus');

const routes = require('./routes');

// Create koa app
const app = koa();

// middleware
app.use(logger());
app.use(stylus('./pages'));
app.use(serve('./pages'));

// 路由中间件
app.use(route.get('/index', routes.indexPage));
 
app.use(route.get('/', routes.list));
app.use(route.get('/todo/new', routes.add));
app.use(route.get('/todo/:id', routes.show));
app.use(route.get('/todo/delete/:id', routes.remove));
app.use(route.get('/todo/edit/:id', routes.edit));
app.use(route.post('/todo/create', routes.create));
app.use(route.post('/todo/update', routes.update));

// 创建服务器监听
http.createServer(app.callback()).listen(3000);
// app.listen(3000);

console.log('Server listening on port 3000');
