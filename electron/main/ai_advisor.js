/**
 * (遗留接口) 获取旧版 AI 推荐
 * @deprecated 目前主要使用 chatWithAgent 和 aiSearchPrograms
 */
async function getAiRecommendation(userProfile, programs) { return ""; }

/**
 * 与 AI 顾问进行智能对话
 * 支持动态路由到 OpenAI 或 DeepSeek，并通过无痕浏览器进行实时网络爬虫增强回答
 * @param {Array} messages - 历史对话上下文数组
 * @param {Object} keys - 本地存储 API 密钥对象
 * @param {Function} onStatusChange - 状态变更回调函数，通知渲染进程当前执行阶段
 * @returns {Promise<{reply: string, programs: Array}>} 返回 AI 的文本回复和推荐项目 JSON 数组
 */
/**
 * 与 AI 顾问进行智能对话
 * 支持动态路由到 OpenAI 或 DeepSeek，并通过无痕浏览器进行实时网络爬虫增强回答
 * @param {Array} messages - 历史对话上下文数组
 * @param {Object} keys - 本地存储 API 密钥对象
 * @param {Function} onStatusChange - 状态变更回调函数，通知渲染进程当前执行阶段
 * @param {Function} onChunk - 字符流输出回调，实时返回生成的文本片段
 * @param {Object} options - 控制选项（如 isSearchEnabled 联网搜索开关）
 * @returns {Promise<{reply: string, programs: Array}>} 返回 AI 的文本回复和推荐项目 JSON 数组
 */
async function chatWithAgent(messages, keys, onStatusChange = () => {}, onChunk = () => {}, options = {}) {
  const { openAiKey, deepSeekKey } = keys;
  let activeKey, baseUrl, model;
  
  // 获取联网搜索开关状态，默认为开启 (true)
  const isSearchEnabled = options.isSearchEnabled !== false;

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
  
  // 触发“正在思考分析”状态
  if (typeof onStatusChange === 'function') {
    onStatusChange('thinking');
  }

  // 1. Ask LLM (使用升级版的专家导师系统准则，融入引导提问、官网Fact-Checking检索与个性化学习偏好)
  const systemMsg = { 
    role: 'system', 
    content: `你是一个具有多年行业经验、专业且热诚的“留学申请专家导师与顾问”。你的语气应当专业、严谨、温暖且循循善诱，致力于通过科学的规划帮助用户实现留学梦想。

# 核心能力与范围
1. 留学百科全书：解答关于留学的一切事宜，包括院校库与项目探索、申请流程与时间线规划、签证指导、海外生活与住宿指引、费用预算等。
2. 主动背景匹配与定位：如果用户不知道自己适合去哪或能申请什么档次的学校，你应当主动询问并收集用户的关键背景信息（GPA、语言成绩 TOEFL/IELTS、本科专业背景、预算限制、偏好国家等），为其进行定位与录取匹配评估。
3. 探索与推荐：主动为用户发掘、科普并推荐可能适合他们、但他们目前尚未知晓的优质项目。

# 行为准则与回复规范
1. 【语气与排版规范】：你必须展现出极其专业且有亲和力的资深留学顾问人设。你的回答应该结构清晰，重点突出，使用分段和列表形式（如无序列表或数字列表），避免大段文字堆积。
2. 【联网检索与时效性约束】：
   ${isSearchEnabled 
     ? `对于大学的招生要求、录取标准、截止日期等关键信息，必须通过网络检索，且必须优先采信来自学校官网（如 .edu 域名或学校官方发布渠道）的最新、可信数据。
   - 当你不确定或者需要获取最新的政策时，必须触发检索指令。输出格式为：SEARCH:[搜索词]（例如：SEARCH:[帝国理工学院计算机硕士2026年最新录取要求]）。
   - 【严禁提及检索系统】：你绝对不能在回复中说出“根据搜索结果”、“根据网络检索”、“感谢提供搜索结果”等系统化话语。你必须把检索到的背景知识当做你本身就熟知储备的专业知识，直接给出建议，向用户隐蔽后台检索行为。`
     : `【禁止联网检索】：当前处于离线知识库模式，你绝对不能输出以 "SEARCH:" 开头的指令，也不要尝试进行网络搜索。请直接根据你现有的知识库，以最专业的态度为用户提供详实的留学顾问建议。`
   }
3. 【个性化适应与学习能力】：
   - 密切关注并记住用户在当前会话中提到的所有背景数据、偏好和顾虑（如“更喜欢大城市”、“预算有限”、“想走学术研究路线”）。
   - 在后续的对话中，你应当不断调整你的推荐契合度，使每一次给出的方案都比上一次更契合该用户的特定习惯与特征。
4. 【结构化输出与看板联动】：
   - 如果用户表达了对某个项目的强烈意愿，或者你为用户推荐了具体的项目，你必须在回答的最后附加一个 JSON 数组，方便系统一键导入看板：
     RECOMMENDED_PROGRAMS:
     [{"title": "项目名称", "university_id": "大学UUID"}]`
  };

  const msgs = [systemMsg, ...messages];
  
  // 使用流式调用大模型，捕获并智能路由流式字符包
  let response = await callLLMStream(msgs, activeKey, baseUrl, model, onChunk);
  let replyContent = response.choices[0].message.content;

  // 2. Intercept Search (如果触发了 SEARCH:[搜索词] 指令，则主进程自动执行网页抓取并二次调大模型)
  if (replyContent.includes('SEARCH:')) {
    const query = replyContent.split('SEARCH:')[1].split('\n')[0].trim();
    
    // 触发“正在联网检索”状态
    if (typeof onStatusChange === 'function') {
      onStatusChange('searching');
    }
    const searchResults = await callWebScraper(query);
    
    // 触发“正在整理数据”状态
    if (typeof onStatusChange === 'function') {
      onStatusChange('scraping');
    }
    
    msgs.push(response.choices[0].message);
    
    // 优化后的二次提问 Prompt，强约束口吻以消除系统化应答语气，规范知识补充口径
    msgs.push({ 
      role: 'user', 
      content: `【补充最新网页背景资讯】：\n${searchResults}\n\n请结合上述最新背景知识以及你的专业知识储备，直接向用户做出深入、详细的顾问回复。请务必遵守：\n1. 绝对不要在回答中提及“搜索结果”、“网络搜索”、“根据检索”或“感谢提供搜索结果”等话语，直接将检索到的知识点内化输出；\n2. 始终以专业、温和的留学导师口吻给出解答，不得解释系统后台的操作；\n3. 如果有推荐的学校项目，在回答的最后以 RECOMMENDED_PROGRAMS: 格式附带 JSON。` 
    });
    
    // 触发“正在生成建议”状态
    if (typeof onStatusChange === 'function') {
      onStatusChange('responding');
    }
    
    // 第二次调大模型生成最终最终结果，直接向前端流式传输整个结果
    response = await callLLMStream(msgs, activeKey, baseUrl, model, onChunk);
    replyContent = response.choices[0].message.content;
  }

  // 3. Extract JSON (使用正则表达式稳健提取项目一键导入 JSON 数组，并从回复内容中完美剥离，防止漏出)
  let recommendedPrograms = [];
  const jsonRegex = /RECOMMENDED_PROGRAMS:[\s\S]*?(\[[\s\S]*?\])/i;
  const jsonMatch = replyContent.match(jsonRegex);
  
  if (jsonMatch) {
    let jsonStr = jsonMatch[1].trim();
    try {
      // 尝试标准解析
      recommendedPrograms = JSON.parse(jsonStr);
    } catch(e) { 
      console.error('Failed to parse programs json, trying markdown strip', e); 
      try {
        // 容错解析：如果带有 markdown json 标记，去除标记后再次尝试解析
        const cleanJsonStr = jsonStr.replace(/```json|```/g, '').trim();
        recommendedPrograms = JSON.parse(cleanJsonStr);
      } catch (innerE) {
        console.error('Failed to parse programs json even after cleanup', innerE);
      }
    }
    // 将 RECOMMENDED_PROGRAMS 及其后的所有内容从显示回复中剥离，防止页面上展示 JSON 文本
    replyContent = replyContent.replace(/RECOMMENDED_PROGRAMS:[\s\S]*/i, '').trim();
  }

  return { reply: replyContent, programs: recommendedPrograms };
}

/**
 * 核心底层函数：向大模型 API 发起流式 HTTP 请求并解码 SSE 数据流
 * @param {Array} messages - 对话上下文
 * @param {string} apiKey - API Key
 * @param {string} baseUrl - 大模型 API Endpoint
 * @param {string} model - 模型名称
 * @param {Function} onChunk - 字符片段实时回调函数
 */
async function callLLMStream(messages, apiKey, baseUrl, model, onChunk) {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, stream: true }) // 开启 Stream 模式
  });
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("大模型流式调用 API 错误: " + errText);
  }
  
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = '';
  let fullText = '';
  
  // SEARCH 前缀检测状态控制变量
  let isHeaderChecked = false;
  let headerBuffer = '';
  let isStreamingActive = true;
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    // 将二进制二进制 Buffer 解码为字符串并存入缓冲区
    const chunkStr = decoder.decode(value, { stream: true });
    buffer += chunkStr;
    
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 保留最后一行的未完整部分
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      
      const dataStr = trimmed.slice(6);
      if (dataStr === '[DONE]') continue;
      
      try {
        const parsed = JSON.parse(dataStr);
        const content = parsed.choices[0]?.delta?.content || '';
        if (!content) continue;
        
        fullText += content;
        
        // 校验首个文本片段，过滤掉 SEARCH 指令前缀
        if (!isHeaderChecked) {
          headerBuffer += content;
          if (headerBuffer.length >= 15) {
            isHeaderChecked = true;
            if (headerBuffer.trim().startsWith('SEARCH:')) {
              // 检测到以 SEARCH: 开头，将其静默拦截，避免系统检索词打印在用户气泡中
              isStreamingActive = false;
            } else {
              // 正常对话回复，将缓冲区累积的文字一次性全部推回 React 前端
              onChunk(headerBuffer);
            }
          }
        } else {
          // 校验通过，如果是非拦截状态，源源不断推回流式数据
          if (isStreamingActive) {
            onChunk(content);
          }
        }
      } catch (e) {
        // 忽略可能发生的不完整 JSON 解析错误
      }
    }
  }
  
  // 流结束后兜底校验，若文本过短（<15字符）导致未进入分支，进行最后一次推流
  if (!isHeaderChecked && headerBuffer) {
    if (!headerBuffer.trim().startsWith('SEARCH:')) {
      onChunk(headerBuffer);
    }
  }
  
  return { choices: [{ message: { content: fullText } }] };
}

/**
 * 通用底层函数：向特定大模型 API 发送非流式请求 (保留供其他接口使用)
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
