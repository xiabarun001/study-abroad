async function getAiRecommendation(userProfile, programs) { return ""; }

async function chatWithAgent(messages, keys) {
  const { llmKey, searchKey } = keys;
  if (!llmKey) throw new Error("大模型 API 密钥未配置，请先在设置中填写。");
  
  // 1. Ask LLM
  const systemMsg = { role: 'system', content: `你是一个专业的留学申请导师顾问。如果用户询问某个具体大学的最新招生要求、录取条件等，并且你不太确定，请输出精确内容：SEARCH:[搜索词]。除此之外正常回答。如果用户决定申请某个项目，或者你为用户推荐了具体的项目，请必须在回答的最后附加一个JSON数组（包含你推荐或提过的项目）：
RECOMMENDED_PROGRAMS:
[{"title": "项目名称", "university_id": "大学UUID"}]` };

  const msgs = [systemMsg, ...messages];
  
  let response = await callOpenAI(msgs, llmKey);
  let replyContent = response.choices[0].message.content;

  // 2. Intercept Search
  if (replyContent.includes('SEARCH:')) {
    const query = replyContent.split('SEARCH:')[1].split('\n')[0].trim();
    const searchResults = await callTavily(query, searchKey);
    msgs.push(response.choices[0].message);
    msgs.push({ role: 'user', content: `以下是网络搜索结果:\n${searchResults}\n请结合以上结果回答我的问题，并在最后提供 RECOMMENDED_PROGRAMS JSON。` });
    
    response = await callOpenAI(msgs, llmKey);
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

async function callOpenAI(messages, apiKey) {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'deepseek-chat', messages })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error("LLM API 错误: " + errText);
  }
  return res.json();
}

async function callTavily(query, apiKey) {
  if (!apiKey) return "未配置 Search API Key，无法搜索。";
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey, query, search_depth: 'basic' })
  });
  if (!res.ok) return "搜索失败。";
  const data = await res.json();
  return data.results.map(r => r.content).join('\n');
}

module.exports = { getAiRecommendation, chatWithAgent };
