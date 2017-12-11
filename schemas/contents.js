
var mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    // 关联字段 - 内容分类的id
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    // 用户
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // 时间
    time: {
        type: Date,
        default: Date.now()
    },
    // 阅读量
    views: {
        type: Number,
        default: 0
    },
    title: String,
    // 描述
    description: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    // 评论
    comments: {
        type: Array,
        default: []
    }
});