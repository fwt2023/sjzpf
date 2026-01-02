import webpush from 'web-push';

// 从环境变量读取（后面设置）
webpush.setVapidDetails(
  'mailto:1875665271@qq.com', // 随便填你的邮箱
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

let subscription = null;

// API：保存订阅（客户端调用）
export async function onRequestPost({ request, env }) {
  const body = await request.json();
  subscription = body.subscription;
  return new Response('订阅成功', { status: 200 });
}

// 定时任务：每天运行
export const config = { schedule: "0 0 * * *" }; // UTC 0点 = 中国早上8点

export async function onScheduled(event, env, ctx) {
  if (!subscription) return;

  // 从 localStorage 获取任务？不行，后端不知道。
  // 简单方案：固定提醒 + 打开网页查看详情
  const payload = JSON.stringify({
    title: '🎯 皮肤交易日历提醒',
    body: '今天有任务等着你完成！快打开日历查看详情～'
  });

  try {
    await webpush.sendNotification(subscription, payload);
  } catch (error) {
    console.error('推送失败', error);
    subscription = null; // 失效就清空
  }
}
