// 应用程序的启动入口文件

var express = require('express');

var swig = require('swig');

var mongoose = require('mongoose');

var bodyParser = require('body-parser');

// 引入cookies模块，用来保存用户登录状态，防止刷新登录状态消失
var Cookies = require('cookies');

var app = express();

var User = require('./models/User');

app.use('/public', express.static(__dirname + '/public'));

app.engine('html', swig.renderFile);

app.set('views', './view');

app.set('view engine', 'html');

// 在开发过程中需要取消模板缓存，正式上线需要缓存
swig.setDefaults({ cache: false });

app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    req.cookies = new Cookies(req, res);
    req.userInfo = {};
    // 刷新页面的时候，解析cookie信息
    if (req.cookies.get('userInfo')) {
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));
            // 获取当前登录用户是否是管理员
            /*User.findById(req.userInfo._id).then(function(userInfo) {
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })*/
        } catch(e) {
            next();
        }
    }
    next();
});

app.use('/admin', require('./routers/admin'));
app.use('/api', require('./routers/api'));
app.use('/', require('./routers/main'));

mongoose.connect('mongodb://localhost:27018/Blog', function(err) {
    if (err) {
        console.log('数据库链接失败');
    } else {
        console.log('数据库链接成功');
        // 监听http请求
        app.listen(8081);
    }
});

