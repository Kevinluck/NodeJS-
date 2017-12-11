var express = require('express');
var router = express.Router();
var User = require('../models/User');
var Category = require('../models/Category');
var Content = require('../models/Content');

router.use(function(req, res, next) {
    // 判断当前用户是否是管理员
    if (!req.userInfo.isAdmin) {
        res.send('不是管理员');
        return;
    }
    next();
});

router.get('/', function(req, res, next) {
    res.render('admin/index', {
        userInfo: req.userInfo
    });
});

// 用户管理
router.use('/user', function(req, res, next) {
    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 1;
    // 获取总数据条数
    User.count().then(function(count) {
        // 总页数
        pages = Math.ceil(count/limit);
        // 取最小值，page超过总页数，就取总页数的值
        page = Math.min(page, pages);
        // 取最大值，page小于1，就取1
        page = Math.max(page, 1);

        var skip = (page - 1) * limit;

        User.find().limit(limit).skip(skip).then(function(users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                url: 'user'
            });
        });
    });

});

// 分类管理
router.get('/category', function(req, res, next) {
    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 1;
    Category.count().then(function(count) {
        pages = Math.ceil(count/limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);

        var skip = (page - 1) * limit;

        Category.find().sort({_id: -1}).limit(limit).skip(skip).then(function(categories) {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                url: 'category'
            });
        });
    });
});

// 添加分类
router.get('/category/add', function(req, res) {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    });
});

// 添加分类的保存
router.post('/category/add', function(req, res) {
    var name = req.body.name || '';

    if (name === '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '名称不能为空'
        });
        return;
    }

    // 判断数据库中是否已存在当前的分类
    Category.findOne({
        name: name
    }).then(function(result) {
        // 存在
        if (result) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类名称已存在'
            });
            return Promise.reject();
        } else {
            return new Category({
                name: name
            }).save();
        }
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '分类保存成功',
            url: '/admin/category'
        });
    });
});

// 分类修改
router.get('/category/edit', function(req, res) {
    var id = req.query.id || '';

    Category.findOne({
        _id: id
    }).then(function(result) {
        if (!result) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '该分类名称不存在'
            });
            return;
        }
        res.render('admin/category_edit', {
            userInfo: req.userInfo,
            name: result.name
        });
    });
});

// 提交分类修改
router.post('/category/edit', function(req, res) {
    var id = req.query.id || '';
    var name = req.body.name;

    Category.findOne({
        _id: id
    }).then(function(result) {
        if (!result) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '该分类名称不存在'
            });
            return Promise.reject();
        } else {
            if (name === result.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功'
                });
                return Promise.reject();
            } else {
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                });
            }
        }
    }).then(function(result) {
        if (result) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '数据库中已经存在同名分类'
            });
            return Promise.reject();
        } else {
            return Category.update({
                _id: id
            }, {
                name: name
            });
        }
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/category'
        });
    });
});

// 删除
router.get('/category/delete', function(req, res) {
    var id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'
        });
    });
});

// 博客内容
router.get('/content', function(req, res) {
    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 1;
    Content.count().then(function(count) {
        pages = Math.ceil(count/limit);
        page = Math.min(page, pages);
        page = Math.max(page, 1);

        var skip = (page - 1) * limit;

        Content.find().sort({time: -1}).limit(limit).skip(skip).populate(['category', 'user']).then(function(contents) {
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,
                page: page,
                count: count,
                limit: limit,
                pages: pages,
                url: 'content'
            });
        });
    });
});

// 内容添加
router.get('/content/add', function(req, res) {
    Category.find().sort({_id: -1}).then(function(result) {
        res.render('admin/content_add', {
            userInfo: req.userInfo,
            categories: result
        });
    });
});

// 内容保存
router.post('/content/add', function(req, res) {
    if (req.body.title === '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '标题不能为空'
        });
        return;
    }
    new Content({
        category: req.body.category,
        user: req.userInfo._id.toString(),
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).save().then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        });
    });
});

// 博客内容修改
router.get('/content/edit', function(req, res) {
    var categoryArr = [];
    Category.find().then(function(result) {
        categoryArr = result;
        return Content.findOne({
            _id: req.query.id
        }).populate('category');
    }).then(function(data) {
        if (!data) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '该内容不存在'
            });
            return;
        }
        res.render('admin/content_edit', {
            userInfo: req.userInfo,
            categories: categoryArr,
            content: data
        });
    });
});

// 内容修改保存
router.post('/content/edit', function(req, res) {
    var id = req.query.id;
    if (req.body.title === '' || req.body.description === '' || req.body.content === '') {
        res.render('admin/error', {
            userInfo: req.userInfo,
            message: '标题，简介和内容都不能为空'
        });
        return;
    }
    Content.update({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/content'
        });
    });
});

// 删除内容
router.get('/content/delete', function(req, res) {
    var id = req.query.id;
    Content.remove({
        _id: id
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        });
    });
});

module.exports = router;