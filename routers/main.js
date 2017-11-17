var express = require('express');
// 创建路由对象
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('main/index', {
        userInfo: req.userInfo
    });
});

module.exports = router;