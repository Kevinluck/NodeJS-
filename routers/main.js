var express = require('express');
var router = express.Router();
var Category = require('../models/Category');
var Content = require('../models/Content');

var data;

// 处理通用数据
router.use(function(req, res, next) {
    data = {
        userInfo: req.userInfo,
        categories: []
    };

    Category.find().then(function(result) {
        data.categories = result;
        next();
    });
});

router.get('/', function(req, res, next) {
    data.category= req.query.categoryId || '';
    data.contents= [];
    data.count= 0;
    data.page= Number(req.query.page || 1);
    data.limit= 1;
    data.pages= 0;

    // 数据查询条件
    var where = {};

    if (data.category) {
        where.category = data.category;
    }

    Category.find().then(function(result) {
        data.categories = result;
        return Content.where(where).count();
    }).then(function(count) {
        data.count = count;
        data.pages = Math.ceil(data.count/data.limit);
        data.page = Math.min(data.page, data.pages);
        data.page = Math.max(data.page, 1);

        var skip = (data.page - 1) * data.limit;
        return Content.where(where).find().sort({time: -1}).limit(data.limit).skip(skip).populate(['category', 'user']);
    }).then(function(contents) {
        data.contents = contents;
        res.render('main/index', data);
    });
});

// 阅读全文
router.get('/view', function(req, res) {
    var contentid = req.query.contentid || '';

    Content.findOne({
        _id: contentid
    }).then(function(result) {
        result.views++;
        result.save();
        data.content = result;
        res.render('main/view', data);
    });
});

module.exports = router;