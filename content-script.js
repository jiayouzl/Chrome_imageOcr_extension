// 监听 background 传来的数据 可对页面dom操作
chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
    console.log('收' + data);
    console.log('收到来自background的消息：' + JSON.stringify(data));
    navigator.clipboard.writeText(data['data']).then(() => {
        alert('复制成功!');  // 复制成功后的提示
    });
});