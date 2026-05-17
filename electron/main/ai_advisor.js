/**
 * (遗留接口) 获取旧版 AI 推荐
 * @deprecated 目前主要使用 chatWithAgent 和 aiSearchPrograms
 */
async function getAiRecommendation(userProfile, programs) { return ""; }

/**
 * 与 AI 顾问进行智能对话
 * 支持动态路由到 OpenAI 或 DeepSeek，并通过无痕浏览器进行实时网络爬虫增强回答
 * @param {Array} messages - 历史对话上下文数组
 * @param {Object} keys - 本地存储的 API 密钥对象
 * @returns {Promise<{reply: string, programs: Array}>} 返回 AI 的文本回复和推荐项目 JSON 数组
 */
async function chatWithAgent(messages, keys) {
  const { openAiKey, deepSeekKey } = keys;
  let activeKey, baseUrl, model;
  
  if (deepSeekKey) {
    activeKey = deepSeekKey;
    baseUrl = 'https://api.deepseek.com/v1/chat/completions';
    model = 'deepseek-chat';
  } else if (openAiKey) {
    activeKey = openAiKey;
    baseUrl = 'https://api.openai.com/v1/chat/completions';
    model = 'gpt-4o-mini';
  } else {
    throw new Error("大模型 API 密钥未配置，请先在设置中填写 OpenAI 或 DeepSeek 密钥。");
  }
  
  // 1. Ask LLM
  const systemMsg = { role: 'system', content: `你是一个专业的留学申请导师顾问。如果用户询问某个具体大学的最新招生要求、录取条件等，并且你不太确定，请输出精确内容：SEARCH:[搜索词]。除此之外正常回答。如果用户决定申请某个项目，或者你为用户推荐了具体的项目，请必须在回答的最后附加一个JSON数组（包含你推荐或提过的项目）：
RECOMMENDED_PROGRAMS:
[{"title": "项目名称", "university_id": "大学UUID"}]` };

  const msgs = [systemMsg, ...messages];
  
  let response = await callLLM(msgs, activeKey, baseUrl, model);
  let replyContent = response.choices[0].message.content;

  // 2. Intercept Search
  if (replyContent.includes('SEARCH:')) {
    const query = replyContent.split('SEARCH:')[1].split('\n')[0].trim();
    const searchResults = await callWebScraper(query);
    msgs.push(response.choices[0].message);
    msgs.push({ role: 'user', content: `以下是网络搜索结果:\n${searchResults}\n请结合以上结果回答我的问题，并在最后提供 RECOMMENDED_PROGRAMS JSON。` });
    
    response = await callLLM(msgs, activeKey, baseUrl, model);
    replyContent = response.choices[0].message.content;
  }

  // 3. Extract JSON
  let recommendedPrograms = [];
  if (replyContent.includes('RECOMMENDED_PROGRAMS:')) {
    const parts = replyContent.split('RECOMMENDED_PROGRAMS:');
    replyContent = parts[0].trim();
    try {
      recommendedPrograms = JSON.parse(parts[1].trim());
    } catch(e) { console.error('Failed to parse programs json'); }
  }

  return { reply: replyContent, programs: recommendedPrograms };
}

/**
 * 通用底层函数：向特定大模型 API 发送请求
 * @param {Array} messages - 消息列表
 * @param {string} apiKey - 选中的 API Key
 * @param {string} baseUrl - 选中的 API 端点
 * @param {string} model - 选中的模型名称
 */
async function callLLM(messages, apiKey, baseUrl, model) {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("LLM API 错误: " + errText);
  }
  return res.json();
}

const { BrowserWindow } = require('electron');

/**
 * 引擎爬取器封装
 * 在后台隐藏创建一个 BrowserWindow 实例访问指定 URL 并执行 DOM 提取代码
 * @param {string} url - 要爬取的网页地址
 * @param {string} extractCode - 在目标网页内执行的 JavaScript 提取脚本
 * @param {number} timeoutMs - 超时时间，默认 15 秒
 * @returns {Promise<string>} 提取到的文本结果
 */
async function scrapeEngine(url, extractCode, timeoutMs = 15000) {
  return new Promise((resolve) => {
    let win = new BrowserWindow({
      show: false,
      width: 1024,
      height: 768,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    const timeout = setTimeout(() => {
      if (win) { win.destroy(); win = null; }
      resolve("");
    }, timeoutMs);

    win.webContents.on('did-finish-load', async () => {
      try {
        const text = await win.webContents.executeJavaScript(extractCode);
        clearTimeout(timeout);
        if (win) { win.destroy(); win = null; }
        resolve(text || "");
      } catch (err) {
        clearTimeout(timeout);
        if (win) { win.destroy(); win = null; }
        resolve("");
      }
    });

    // Mask user agent to avoid basic blocks
    win.webContents.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    win.loadURL(url).catch(err => {
      clearTimeout(timeout);
      if (win) { win.destroy(); win = null; }
      resolve("");
    });
  });
}

/**
 * 并发调用爬虫引擎获取必应和百度的综合搜索结果
 * @param {string} query - 搜索关键字
 * @returns {Promise<string>} 格式化后的双引擎合并搜索结果字符串
 */
async function callWebScraper(query) {
  const bingUrl = `https://cn.bing.com/search?q=${encodeURIComponent(query)}`;
  const bingCode = `
    (() => {
      const results = Array.from(document.querySelectorAll('.b_algo'));
      return results.slice(0, 8).map(r => {
        const title = r.querySelector('h2')?.innerText || '';
        const desc = r.querySelector('.b_caption p')?.innerText || '';
        return title + ' : ' + desc;
      }).join('\\n\\n');
    })();
  `;

  const baiduUrl = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`;
  const baiduCode = `
    (() => {
      const results = Array.from(document.querySelectorAll('.result.c-container'));
      return results.slice(0, 8).map(r => {
        const title = r.querySelector('h3')?.innerText || '';
        const desc = r.querySelector('.c-abstract')?.innerText || r.querySelector('.c-font-normal')?.innerText || '';
        return title + ' : ' + desc;
      }).join('\\n\\n');
    })();
  `;

  // 并发请求必应和百度，提高覆盖率和效率
  const [bingResult, baiduResult] = await Promise.all([
    scrapeEngine(bingUrl, bingCode),
    scrapeEngine(baiduUrl, baiduCode)
  ]);

  let finalResult = "";
  if (bingResult) finalResult += "【来自必应的搜索结果】:\\n" + bingResult + "\\n\\n";
  if (baiduResult) finalResult += "【来自百度的搜索结果】:\\n" + baiduResult + "\\n\\n";

  return finalResult.trim() || "未能检索到相关网络信息。";
}

/**
 * AI 实时爬取并提炼项目结构化数据
 * 爬虫抓取最新资讯后，交由 LLM 进行 JSON 数据清洗与结构化输出
 * @param {Object} params - 包含 keyword, countries, limit 等搜索参数
 * @param {Object} keys - 大模型 API 密钥
 * @returns {Promise<Array>} 符合标准项目格式的 JSON 数组
 */
async function aiSearchPrograms({ keyword, countries, limit }, keys) {
  const { openAiKey, deepSeekKey } = keys;
  let activeKey, baseUrl, model;
  
  if (deepSeekKey) {
    activeKey = deepSeekKey;
    baseUrl = 'https://api.deepseek.com/v1/chat/completions';
    model = 'deepseek-chat';
  } else if (openAiKey) {
    activeKey = openAiKey;
    baseUrl = 'https://api.openai.com/v1/chat/completions';
    model = 'gpt-4o-mini';
  } else {
    throw new Error("大模型 API 密钥未配置，请先在设置中填写。");
  }
  
  // 1. Search the web using internal scraper first
  let searchQuery = "顶级大学 硕士 博士 招生项目";
  if (keyword) searchQuery = `${keyword} ${searchQuery}`;
  if (countries && countries.length > 0) searchQuery = `${countries.join(' ')} ${searchQuery}`;
  
  const searchResults = await callWebScraper(searchQuery);
  
  // 2. Ask LLM to extract JSON
  const systemMsg = { 
    role: 'system', 
    content: `你是一个智能留学项目检索助手。你需要阅读下面提供的实时网络搜索结果，提取相关的大学招生项目。
你必须返回一个严格的 JSON 数组（不要包含任何其他文字或 markdown 标记）。
每个项目对象的格式必须严格如下：
{
  "id": "uuid或唯一标识",
  "title": "项目名称 (例如：计算机科学理学硕士)",
  "description": "项目的简短描述，包括研究方向或特色",
  "url": "相关链接或填 '#'",
  "universities": {
    "name_zh": "大学中文名称",
    "countries": { "name_zh": "国家中文名称" }
  }
}
最多返回 ${limit || 10} 个项目。` 
  };
  
  const userMsg = {
    role: 'user',
    content: `这是搜索结果:\n${searchResults}\n请提取这些大学项目并按照指定的JSON数组格式返回，确保不包含任何额外的字符，直接以 [ 开头，] 结尾。`
  };

  const msgs = [systemMsg, userMsg];
  const response = await callLLM(msgs, activeKey, baseUrl, model);
  let replyContent = response.choices[0].message.content.trim();
  
  // Try parsing the json
  if (replyContent.startsWith('\`\`\`json')) {
    replyContent = replyContent.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  } else if (replyContent.startsWith('\`\`\`')) {
    replyContent = replyContent.replace(/\`\`\`/g, '').trim();
  }

  try {
    return JSON.parse(replyContent);
  } catch (e) {
    console.error('Failed to parse AI search json', e, replyContent);
    return [];
  }
}

module.exports = { getAiRecommendation, chatWithAgent, aiSearchPrograms };
