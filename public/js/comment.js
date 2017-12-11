var prepage = 2;
var page = 1;
var pages = 0;
var comments = [];

$('#messageBtn').on('click', function () {
    $.ajax({
        type: 'post',
        url: 'api/comment/post',
        data: {
            content: $('#messageContent').val(),
            contentId: $('#contentId').val()
        },
        dataType: 'json',
        success: function(res) {
            $('#contentId').val('');
            comments = res.data.comments.reverse();
            renderComments();
        }
    });
});

// 页面刷新加载所有评论
$.ajax({
    type: 'get',
    url: 'api/comment',
    data: {
        contentId: $('#contentId').val()
    },
    dataType: 'json',
    success: function(res) {
        comments = res.data.reverse();
        renderComments();
    }
});

$('.pager').delegate('a', 'click', function() {
    if ($(this).parent().hasClass('previous')) {
        page--;
    } else {
        page++;
    }
    renderComments();
});

function renderComments() {
    $('#messageCount').html(comments.length);

    var $lis = $('.pager li');
    var start = Math.max((page - 1) * prepage, 0);
    var end = Math.min(start + prepage, pages);

    pages = Math.max(Math.ceil(comments.length / prepage), 1);
    $lis.eq(1).html(page + '/' + pages);

    if (page <= 1) {
        page = 1;
        $lis.eq(0).html('<span>没有上一页</span>');
    } else {
        $lis.eq(0).html('<a href="javascript:;">上一页</a>');
    }

    if (page >= pages) {
        page = pages;
        $lis.eq(2).html('<span>没有下一页</span>');
    } else {
        $lis.eq(2).html('<a href="javascript:;">下一页</a>');
    }

    var html = '';
    for (var i = start; i < end; i++) {
        html += '<div class="messageBox">' +
            '<p class="name clear"><span class="fl">' + comments[i].userName + '</span><span class="fr">' + formatDate(comments[i].time) + '</span></p><p>' + comments[i].content + '</p>' +
            '</div>'
    }
    $('.messageList').html(html);
}

function formatDate(d) {
    var date = new Date(d);
    return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}