import webpush from 'web-push';

webpush.setVapidDetails(
  '1875665271@qq.com',  // 随便填你的邮箱
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscription = null;  // 内存保存订阅（单用户够用）

// POST 请求：保存订阅（前端调用）
export const handler = async (event, context) => {
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      subscription = body.subscription;
      console.log('订阅保存成功');
      return { statusCode: 200, body: '订阅成功' };
    } catch (error) {
      return { statusCode: 500, body: '保存失败' };
    }
  }

  // GET 请求：手动触发推送（测试用）
  if (!subscription) {
    return { statusCode: 400, body: '没有订阅，无法推送' };
  }

  const payload = JSON.stringify({
    title: '🎯 皮肤交易日历提醒（测试成功！）',
    body: '通知功能正常！以后每天早上8点会自动提醒你查看今日任务～'
  });

  try {
    await webpush.sendNotification(subscription, payload);
    console.log('推送成功');
    return { statusCode: 200, body: '推送成功！检查你的浏览器通知' };
  } catch (error) {
    console.error('推送失败:', error);
    return { statusCode: 500, body: '推送失败: ' + error.message };
  }
};
