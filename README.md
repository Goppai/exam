# 📘 AI Exam Parser & Tutor

> 基于智谱 GLM-4.6V 的中小学试卷智能解析与讲解系统

## ✨ 项目简介

**AI Exam Parser & Tutor** 是一个面向中小学场景的智能系统，支持：

- 📸 上传试卷图片（数学 / 英语）
- 🧠 使用多模态大模型自动解析试题、学生作答与教师批改
- 🧾 输出结构化 JSON 数据
- 🧑‍🏫 对单题进行“像老师一样”的详细讲解（数学推导 / 英语逐句翻译 + 词汇）
- 🎨 前端以卡片形式展示题目并支持一键讲解

致力于打造：

> **“试卷即数据，错题即讲解，图像即入口”** 的智能学习助手。

---

## 🚀 核心功能

### ✅ 试卷结构化解析

- 自动识别：
  - 题干、选项
  - 学生手写答案
  - 勾选、划线、圈分
  - 教师批改符号（√ × 扣分 得分 批注）
- 输出统一 JSON Schema，便于前端与后续处理。

### ✅ 学科支持

- 📐 数学：计算题、应用题、分数、公式、多步推导
- 📘 英语：选择、填空、阅读理解、翻译、作文

### ✅ 单题智能讲解

- 数学：正确答案 + 分步推导 + 错因分析
- 英语：正确答案 + 逐句翻译 + 关键词汇 + 语法讲解

### ✅ LaTeX 公式规范

- 所有数学表达统一为 `$...$` 包裹的 LaTeX
- 前端可直接用 KaTeX / Markdown 渲染

### ✅ 工程化能力

- 🗃️ 结果缓存（extract / explain）
- ⏱️ 耗时统计
- 🧪 Debug 模式返回原始输出
- 🔁 自动重试
- 🧠 支持 thinking 推理模式
- 📦 Prompt 文件化管理

---

## 🧱 技术架构

```text
.
├── backend/        # FastAPI + 智谱 API
│   ├── app/
│   │   ├── main.py
│   │   ├── extract.py
│   │   ├── explain.py
│   │   ├── services/
│   │   │   └── zhipu_client.py
│   │   └── prompts/
│   │       ├── prompt_math.txt
│   │       ├── prompt_english.txt
│   │       ├── explain_math.txt
│   │       └── explain_english.txt
│   │
│   ├── cache/          # 解析结果缓存
│   ├── cache_explain/  # 讲解结果缓存
│   └── requirements.txt
│
├── frontend/       # React + TS + Ant Design + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuestionCard.tsx
│   │   │   └── MathRenderer.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   └── ...
│   └── package.json
│
└── README.md
```

---

## 🛠️ 技术栈

### 后端

- Python 3.10+
- FastAPI
- zai-sdk（智谱 API）
- Pillow
- python-dotenv

### 前端

- React + TypeScript
- Vite
- Ant Design v6
- KaTeX / react-katex（数学公式渲染）

### 模型

- 🤖 智谱 **GLM-4.6V** 多模态模型
- 支持 `thinking={"type": "enabled"}` 推理模式

---

---

## ⚙️ 环境准备

### 1️⃣ 后端（Backend）

进入后端目录并创建虚拟环境：

````bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

创建 `.env` 文件并填写智谱 API Key：

```env
ZHIPU_API_KEY=你的智谱API_KEY
ZHIPU_USE_THINKING=true

启动后端服务：
uvicorn app.main:app --reload
````

访问 Swagger 文档：
http://localhost:8000/docs

---

### 2️⃣ 前端（Frontend）

```bash
cd frontend
yarn install
yarn dev
```

浏览器访问：
http://localhost:5173

---

## 🗃️ 缓存机制

- 解析缓存：`backend/cache/`
- 讲解缓存：`backend/cache_explain/`

系统会根据输入内容自动生成缓存 Key，命中缓存可显著提升速度并节省模型调用成本。
修改 Prompt 后建议清空缓存：

```bash
rm -rf backend/cache/*
rm -rf backend/cache_explain/*
```

## 🏆 项目亮点

- 🎯 面向真实中小学试卷场景
- 🤖 多模态大模型 + 高质量结构化输出
- 🧠 thinking 推理增强复杂理解能力
- 🧾 工程化设计：缓存 / Prompt 管理 / 调试模式
- 🧑‍🏫 教学友好：
  - 数学：分步推导 + 错因分析
  - 英语：逐句翻译 + 关键词汇 + 语法讲解
- 🎨 前后端完整闭环，可直接演示

## 🔮 后续可扩展

- 📚 错题本与学情分析
- 📝 作文自动点评
- 👨‍👩‍👧 家长 / 教师端
- 📊 学习统计报表
- 🌐 多语言支持

## 📄 License

本项目仅用于学习与比赛展示，如需商业化请联系作者。

## 🙌 致谢

感谢：

- 智谱 AI 提供强大的 GLM-4.6V 多模态模型能力
- 开源社区提供的优秀前后端工具链
