# 山海 yuyy · Personal Space

一份以现场交付、AI 项目和持续内容实践为核心的个人职业主页。网站采用纯 HTML、CSS 和 JavaScript，包含响应式布局、现场与生活相册、项目与社交账号弹窗、邮件/电话联系和简历下载。

## 在线访问

- 当前服务器预览：[http://43.108.22.156](http://43.108.22.156)
- 计划域名：`https://shanhaiyy.xyz`（域名审核和 DNS/HTTPS 待完成）

## 本地运行

```bash
node server.cjs
```

然后访问 `http://127.0.0.1:4173/`。

生产页面由 `index.html`、`app.js`、四个样式表和 `assets/` 构成。`deploy/` 保存可公开的站点接入片段；服务器上的完整代理配置和凭据不在仓库中。

## Personal Space Builder Skill

仓库内的 [`skills/personal-space-builder`](skills/personal-space-builder/) 是本次制作流程沉淀出的可复用 Codex Skill。它覆盖分阶段需求访谈、证据与隐私边界、文案和线框确认、视觉实现、交互检查、服务器发布及公开仓库审计。

示例调用：

```text
Use $personal-space-builder to turn my resume and materials into a polished public career website.
```

公开发布前可运行：

```bash
python skills/personal-space-builder/scripts/publication_audit.py .
```

## 内容与授权说明

代码、个人照片、简历和账号截图的权利归各自权利人所有。本仓库公开可见不自动授予复制个人照片、简历或身份资料的许可；仓库暂未附加开源许可证。
