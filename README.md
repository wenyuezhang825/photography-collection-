# 摄影作品集（静态网站）

一个简洁高级风格的个人摄影作品集网站：封面 + 作品网格 + 筛选 + 灯箱预览 + 关于 + 联系 + 暗/亮主题切换。

## 如何预览

### 方式 1：直接打开（最简单）

用浏览器打开 `index.html` 即可。

### 方式 2：本地起一个静态服务器（推荐）

在当前目录运行：

```bash
python3 -m http.server 5173
```

然后访问 `http://localhost:5173`

## 如何替换为你的照片

在 `index.html` 中搜索 `images.unsplash.com`，把每张图片的 `src` 替换成你的图片地址即可。

如果你想用本地图片：

1. 新建 `assets/` 目录，把图片放进去（例如 `assets/01.jpg`）
2. 把 `src="..."` 改成 `src="./assets/01.jpg"`

建议图片宽度至少 1600px，保证大图预览清晰。

## 自定义信息

在 `index.html` 里带 `data-field` 的位置改掉即可，比如：

- `data-field="name"`：你的名字
- `data-field="email"`：邮箱
- `data-field="wechat"`：微信号
- `data-field="instagram"`：社媒

