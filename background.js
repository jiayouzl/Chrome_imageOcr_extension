//https://account.daocloud.io/signup

console.log('Starting background-devtools');

// //读取本地存储
// chrome.storage.local.get(['data'], function (result) {
//     console.log('当前值为：' + result.data);
// });
// //写入本地存储
// chrome.storage.local.set({ data: 'test' }, function () {
//     console.log('写入成功');
// });
// //读取本地存储
// chrome.storage.local.get(['data'], function (result) {
//     console.log('当前值为：' + result.data);
// });
// //删除本地存储
// chrome.storage.local.remove(['data'], function () {
//     console.log('删除成功');
// });
// //读取本地存储
// chrome.storage.local.get(['data'], function (result) {
//     console.log('当前值为：' + result.data);
// });

// 注册右键菜单
chrome.contextMenus.create({
    id: 'my-custom-menu-ai',
    title: '识别选择的验证码',
    contexts: ['image'],
});

// //创建多级菜单
// chrome.contextMenus.create({
//     id: 'my-custom-menu-ai-1',
//     title: '识别',
//     contexts: ['image'],
//     parentId: 'my-custom-menu-ai'
// });
// //创建分离线
// chrome.contextMenus.create({
//     id: 'my-custom-menu-ai-3',
//     type: 'separator',
//     contexts: ['image'],
//     parentId: 'my-custom-menu-ai'
// });
// //创建多级菜单
// chrome.contextMenus.create({
//     id: 'my-custom-menu-ai-2',
//     title: '官方网站',
//     contexts: ['image'],
//     parentId: 'my-custom-menu-ai'
// });

// 监听右键菜单点击事件
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId != '') {
        // console.log('info: ' + JSON.stringify(info));
        // console.log('右键菜单点击事件: ' + info.menuItemId);
    }
    if (info.menuItemId == 'my-custom-menu-ai') {
        // 在这里执行你想要的操作
        // console.log(info.srcUrl);
        uploadImg(downloadImg(info.srcUrl))
    }
    if (info.menuItemId == 'my-custom-menu-ai-1') {
        uploadImg(downloadImg(info.srcUrl))
    }
    if (info.menuItemId == 'my-custom-menu-ai-2') {
        //在新标签页打开指定的url
        chrome.tabs.create({ url: 'https://www.163.com' });
    }
});

var myAjax = function ({ url, method, successCb = () => { }, errCb = () => { }, responseType, contentType, data }) {
    fetch(url, {
        method: method,
        body: data,
        headers: {
            'Content-Type': contentType,
        }
    }).then(res => {
        if (res.ok === true) {
            if (responseType === 'arraybuffer') {
                return res.arrayBuffer()
            } else {
                return res.text()
            }
        } else {
            console.log('请求失败');
            errCb()
        }
    }).then(res => {
        successCb(res)
    }).catch(err => {
        errCb(err)
    })
}

// 图片上传
var downloadImg = function (src) {
    return new Promise((resolve, reject) => {
        if (!src) {
            return reject('链接为空')
        }

        const arr = src.split('/')
        let filename = arr[arr.length - 1] || ''

        const mngFile = (code) => {
            const length = code.length

            var abuffer = code
            var uBuffer = new Uint8Array(abuffer)
            for (var i = 0; i < length; i++) {
                uBuffer[i] = code.charCodeAt(i) & 0xff
            }
            filename = 'test.png'
            // filename = prompt('请输入文件名', filename)
            // if (!filename) {
            //     return reject('取消上传')
            // }
            var blob = new File([uBuffer], filename, {
                type: 'image/png'
            })
            resolve(blob)
        }

        myAjax({
            url: src,
            responseType: 'arraybuffer',
            contentType: 'arraybuffer',
            method: 'GET',
            successCb: mngFile,
            errCb: () => {
                reject('图片获取失败')
            }
        })
    })
}
var uploadImg = async function (src) {
    const formData = new FormData()
    formData.append('image', await src)

    // fetch('http://192.168.5.101:9898/ocr/file', {
    fetch('http://120.48.9.236:9898/ocr/file', {
        method: 'POST',
        body: formData,
    }).then(res => {
        if (res.ok === true) {
            return res.text()
        } else {
            console.log('请求失败');
        }
    }).then(res => {
        var result = res.toUpperCase();
        console.log('识别结果:' + result);
        //显示通知
        chrome.notifications.create(null, {
            type: 'basic',
            iconUrl: 'image/icon.png',
            title: '图像验证码AI一键识别',
            message: '识别结果：' + result + '已复制到剪切板。',
        });
        //语音播报
        // chrome.tts.speak('识别结果：' + result, {
        //     lang: 'zh-CN', // 语言 (可选)
        //     rate: 0.8 // 语速 (可选)
        // });
        console.log('复制方法');
        //复制识别结果至剪切板
        //向content-script.js发送消息
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = tabs[0];
            chrome.tabs.sendMessage(tab.id, { type: 'copy', data: result }, function (response) {
                // console.log('content-script.js收到消息了');
                console.log(response);
                // console.log(arguments, chrome.runtime.lastError);//我是content-script.js，我已收到你的消息：这是content-script.js发给我的消息
            });
        });
    }).catch(err => {
        console.log('发生错误:' + err);
    })
}