// 监听 background 传来的数据 可对页面dom操作
chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    // console.log('收' + data);
    console.log('收到来自background的消息：' + JSON.stringify(data));
    sendResponse('我是content-script.js，我已收到你的消息：' + JSON.stringify(data));
    navigator.clipboard.writeText(data['data']).then(() => {
        alert('复制成功!');  // 复制成功后的提示
    });
    // onMessage 返回 true 时候 sendResponse 就可以写在异步当中了
    return true;
});