# 皮肤交易日历 - 使用说明

## 📱 如何在手机上访问

### 方法1：使用批处理文件（最简单）

1. **双击运行** `启动服务器.bat`
2. 会显示手机访问地址，例如：`http://192.168.1.100:8000/skin-trading-calendar.html`
3. 在手机浏览器输入这个地址即可访问
4. **注意**：手机和电脑必须连接同一个WiFi

### 方法2：手动启动Python服务器

1. 打开命令提示符（CMD）
2. 进入文件所在目录：`cd C:\Users\devuser\Desktop\py`
3. 运行命令：`python -m http.server 8000`
4. 查看电脑IP地址：
   - 运行 `ipconfig`
   - 找到 "IPv4 地址"，例如：192.168.1.100
5. 在手机浏览器访问：`http://你的IP:8000/skin-trading-calendar.html`

### 方法3：使用Node.js（如果安装了Node）

1. 安装http-server：`npm install -g http-server`
2. 运行：`http-server -p 8000`
3. 手机访问显示的地址

### 方法4：上传到免费托管平台（永久访问）

可以上传到以下平台，获得永久访问链接：

- **GitHub Pages**（免费）
  1. 创建GitHub仓库
  2. 上传 `skin-trading-calendar.html`
  3. 开启GitHub Pages
  4. 获得链接：`https://你的用户名.github.io/仓库名/skin-trading-calendar.html`

- **Netlify**（免费，最简单）
  1. 访问 https://www.netlify.com/
  2. 拖拽文件夹到网站
  3. 立即获得访问链接

- **Vercel**（免费）
  1. 访问 https://vercel.com/
  2. 导入项目
  3. 自动部署

## 💡 常见问题

### Q: 手机访问不了？
A: 检查以下几点：
- 手机和电脑是否连接同一个WiFi
- 电脑防火墙是否阻止了端口8000
- IP地址是否正确

### Q: 数据会同步吗？
A: 目前数据保存在浏览器本地，电脑和手机的数据是独立的。如果需要同步，可以：
- 使用"导出日历"功能导出数据
- 或者我可以帮你添加云端同步功能

### Q: 关闭电脑后手机还能访问吗？
A: 不能。如果需要随时访问，建议使用方法4上传到托管平台。

## 🔧 需要帮助？

如果遇到问题，可以：
1. 检查Python是否已安装：`python --version`
2. 如果没有Python，可以从 https://www.python.org/ 下载安装
3. 或者使用方法4上传到免费托管平台
