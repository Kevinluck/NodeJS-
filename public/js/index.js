$(function() {
    const $loginBox = $('#loginBox');
    const $registerBox = $('#registerBox');
    const $userInfo = $('#userInfo');

    // 切换到注册
    $loginBox.find('a').on('click', function() {
        $registerBox.show();
        $loginBox.hide();
    });

    // 切换到登录
    $registerBox.find('a').on('click', function() {
        $loginBox.show();
        $registerBox.hide();
    });

    // 注册
    $registerBox.find('button').on('click', function() {
        $.ajax({
            type: 'post',
            url: 'api/user/register',
            data: {
                username: $registerBox.find('[name = "username"]').val(),
                password: $registerBox.find('[name = "password"]').val(),
                repassword: $registerBox.find('[name = "repassword"]').val()
            },
            dataType: 'json',
            success: function(res) {
                console.log(res);
                $registerBox.find('.colWarning').html(res.message);
                if (!res.code) {
                    setTimeout(function() {
                        $loginBox.show();
                        $registerBox.hide();
                    }, 1000);
                }
            }
        });
    });

    // 登录
    $loginBox.find('button').on('click', function() {
        $.ajax({
            type: 'post',
            url: 'api/user/login',
            data: {
                username: $loginBox.find('[name = "loginUserName"]').val(),
                password: $loginBox.find('[name = "loginPassWord"]').val()
            },
            dataType: 'json',
            success: function(res) {
                console.log(res);
                if (!res.code) {
                    window.location.reload();
                    /*setTimeout(function() {
                        $loginBox.hide();
                        $userInfo.show();
                        $userInfo.find('.username').html(res.userInfo.username);
                    }, 1000);*/
                }
            }
        })
    });

    // 退出
    $('#logout').on('click', function() {
        $.ajax({
            url: 'api/user/logout',
            success: function(res) {
                if (!res.code) {
                    window.location.reload();
                }
            }
        })
    });
});