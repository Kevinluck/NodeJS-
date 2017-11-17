// 处理后端接口逻辑

var express = require('express');
var router = express.Router();
var User = require('../models/User');

// 统一返回格式
var responseData;

// 初始化
router.use(function(req, res, next) {
    responseData = {
        code: 0,
        message: ''
    };
    next();
});

// 注册
router.post('/user/register', function(req, res, next) {
    // 通过bodyParser接受到前端传进来的数据
    // console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    var isAdmin = false;

    if (username === '') {
        responseData.code = '1';
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }

    if (password === '') {
        responseData.code = '1';
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }

    if (password !== repassword) {
        responseData.code = '3';
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }

    User.findOne({
        username: username
    }).then(function(userInfo) {
        if (userInfo) {
            responseData.code = '4';
            responseData.message = '用户名已被注册';
            res.json(responseData);
            return;
        }

        if (username === 'admin') {
            isAdmin = true;
        }

        var user = new User({
            username: username,
            password: password,
            isAdmin: isAdmin
        });
        return user.save();
    }).then(function() {
        responseData.message = '注册成功';
        res.json(responseData);
    });

});

// 登录
router.post('/user/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    if (username === '' || password === '') {
        responseData.code = '1';
        responseData.message = '用户名和密码不能为空';
        res.json(responseData);
        return;
    }

    User.findOne({
        username: username,
        password: password
    }).then(function(user) {
        if (!user) {
            responseData.code = '2';
            responseData.message = '用户名或密码错误';
            res.json(responseData);
            return;
        }
        responseData.message = '登录成功';
        responseData.userInfo = {
            _id: user._id,
            username: user.username
        };
        req.cookies.set('userInfo', JSON.stringify({
            _id: user._id,
            username: user.username
        }));
        res.json(responseData);
    });
});

// 退出
router.get('/user/logout', function(req, res) {
    req.cookies.set('userInfo', null);
    res.json(responseData);
});

module.exports = router;