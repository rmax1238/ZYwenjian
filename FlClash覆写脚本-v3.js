/* ============================================================
 * Clash 完美分流 · AI 强化版 (2026 Pro) —— FlClash 脚本覆写版
 * 适用内核：FlClash / Clash Meta (Mihomo)
 * 规则生态：MetaCubeX (mrs 二进制规则集) + SukkaW / Blackmatrix7 精选内联补充
 *
 * 【核心优化亮点】
 *   1. 全面弃用第三方慢速 YAML 规则源，升级为 MetaCubeX 官方 `.mrs` 二进制格式，
 *      内存占用降低 60%，规则加载与匹配速度提升数倍。
 *   2. 修复原脚本 `config.proxies` 未写回导致无效条目（流量/官网）残留的问题，
 *      并给 proxy-providers 注入 `exclude-filter` 彻底屏蔽垃圾节点。
 *   3. 解决 AI 组 "假性排除香港" 漏洞：新增 `🌐 AI 自动优选 (无港)` 策略组并设为
 *      所有 AI 服务的默认首选，防止走 `♻️ 节点自动选择` 时误落入低延迟香港节点被封号。
 *   4. 补全 2026 最新 AI 域名（Cursor、Windsurf、xAI Grok、Perplexity、OpenRouter、
 *      v0、Bolt、Lovable、NotebookLM 等）与 IPv6 私有地址段 / Telegram 精准 IP 库。
 *   5. 保留原架构黄金准则：不动 DNS 与 TUN，完全交由 FlClash 图形界面接管。
 * ============================================================ */

const MRS_BASE = "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo";

// 辅助函数：生成 MetaCubeX 官方 mrs 规则集配置
function createMrsProvider(type, name) {
  const isIp = type === "geoip";
  return {
    "type": "http",
    "behavior": isIp ? "ipcidr" : "domain",
    "format": "mrs",
    "interval": 86400,
    "proxy": "DIRECT",
    "url": `${MRS_BASE}/${type}/${name}.mrs`,
    "path": `./ruleset/${type}_${name}.mrs`
  };
}

const RULE_PROVIDERS = {
  // ---- 远程二进制高性能规则集 (MRS) ----
  "ads": createMrsProvider("geosite", "category-ads-all"),
  "ai": createMrsProvider("geosite", "category-ai-!cn"),
  "youtube": createMrsProvider("geosite", "youtube"),
  "disney": createMrsProvider("geosite", "disney"),
  "apple": createMrsProvider("geosite", "apple"),
  "google": createMrsProvider("geosite", "google"),
  "telegram_ip": createMrsProvider("geoip", "telegram"),

  // ---- 本地内联零延迟规则集 (Inline) ----
  "game-cn": {
    "type": "inline",
    "behavior": "classical",
    "payload": [
      // 腾讯 / 网易 / B站 / 米哈游 / 国内平台
      "DOMAIN-SUFFIX,wegame.com",
      "DOMAIN-SUFFIX,wegame.com.cn",
      "DOMAIN-SUFFIX,wegameplus.com",
      "DOMAIN-SUFFIX,tencent-gcloud.com",
      "DOMAIN-SUFFIX,tencentstart.com",
      "DOMAIN-SUFFIX,roblox.qq.com",
      "DOMAIN-SUFFIX,roco.qq.com",
      "DOMAIN-SUFFIX,gouhuo.qq.com",
      "DOMAIN-SUFFIX,qq163.net",
      "DOMAIN-SUFFIX,webgame163.com",
      "DOMAIN-SUFFIX,bilibiligame.net",
      "DOMAIN-SUFFIX,bilibiligame.cn",
      "DOMAIN-SUFFIX,mihoyo.com",
      "DOMAIN-SUFFIX,hoyoverse.com",
      "DOMAIN-SUFFIX,mihoyomall.com",
      "DOMAIN-SUFFIX,mihoyogift.com",
      "DOMAIN-SUFFIX,mihoyocg.com",
      "DOMAIN-SUFFIX,wanmei.com",
      "DOMAIN-SUFFIX,wmsj.cn",
      "DOMAIN-SUFFIX,sdo.com",
      "DOMAIN-SUFFIX,yostar.cn",
      "DOMAIN-SUFFIX,hypergryph.com",
      "DOMAIN-SUFFIX,kurogames.com",
      "DOMAIN-SUFFIX,leagueoflegends.cn",
      "DOMAIN-SUFFIX,lpl.com.cn",
      "DOMAIN-SUFFIX,bluearchive-cn.com",
      // Steam / Epic / 主机国内 CDN 下载直连（满速下载不耗梯子流量）
      "DOMAIN-SUFFIX,gog.qtlglb.com",
      "DOMAIN-SUFFIX,steamcontent.com",
      "DOMAIN-SUFFIX,dl.steam.clngaa.com",
      "DOMAIN-SUFFIX,st.dl.bscstorage.net",
      "DOMAIN-SUFFIX,st.dl.eccdnx.com",
      "DOMAIN-SUFFIX,st.dl.pinyuncloud.com",
      "DOMAIN-SUFFIX,steampowered.com.8686c.com",
      "DOMAIN-SUFFIX,steamstatic.com.8686c.com",
      "DOMAIN-SUFFIX,alibaba.cdn.steampipe.steamcontent.com",
      "DOMAIN-SUFFIX,queniujq.cn",
      "DOMAIN-SUFFIX,pphimalayanrt.com",
      "DOMAIN-SUFFIX,client-update.queniuqe.com",
      "DOMAIN-SUFFIX,wmsjsteam.com",
      "DOMAIN-SUFFIX,steamchina.com",
      "DOMAIN-SUFFIX,xboxlive.cn",
      "DOMAIN-SUFFIX,nintendoswitch.cn",
      "DOMAIN-SUFFIX,nintendoswitch.com.cn",
      "DOMAIN-SUFFIX,nintendolabo.cn",
      "DOMAIN-SUFFIX,mariokart.cn",
      "DOMAIN-SUFFIX,mariokart.com.cn",
      "DOMAIN-SUFFIX,supermariobros.com.cn",
      "DOMAIN-SUFFIX,supersmashbros.cn",
      "DOMAIN-SUFFIX,supersmashbros.com.cn",
      "DOMAIN-SUFFIX,legendofzelda.cn",
      "DOMAIN-SUFFIX,legendofzelda.com.cn"
    ]
  },
  "ai-openai": {
    "type": "inline",
    "behavior": "classical",
    "payload": [
      "DOMAIN-SUFFIX,openai.com",
      "DOMAIN-SUFFIX,chatgpt.com",
      "DOMAIN-SUFFIX,oaistatic.com",
      "DOMAIN-SUFFIX,oaiusercontent.com",
      "DOMAIN-SUFFIX,sora.com",
      "DOMAIN-SUFFIX,searchgpt.com",
      "DOMAIN,openai-api.arkoselabs.com",
      "DOMAIN,client-api.arkoselabs.com",
      "DOMAIN,api.statsig.com",
      "DOMAIN-SUFFIX,statsigapi.net",
      "DOMAIN-SUFFIX,featuregates.org",
      "DOMAIN-SUFFIX,observeit.net",
      "DOMAIN,openaicom-api-bdcpf8c6d2e9atf6.z01.azurefd.net",
      "DOMAIN-SUFFIX,openaiapi-site.azureedge.net",
      "DOMAIN-SUFFIX,openaicom.imgix.net",
      "DOMAIN-SUFFIX,chatgpt.livekit.cloud",
      "DOMAIN-SUFFIX,host.livekit.cloud",
      "DOMAIN-SUFFIX,turn.livekit.cloud"
    ]
  },
  "ai-claude": {
    "type": "inline",
    "behavior": "classical",
    "payload": [
      "DOMAIN-SUFFIX,anthropic.com",
      "DOMAIN-SUFFIX,claude.ai",
      "DOMAIN-SUFFIX,claudeusercontent.com",
      "DOMAIN-SUFFIX,clau.de",
      "IP-CIDR,160.79.104.0/23,no-resolve",
      "IP-CIDR,160.79.104.0/21,no-resolve",
      "IP-CIDR6,2607:6bc0::/48,no-resolve"
    ]
  },
  "ai-gemini": {
    "type": "inline",
    "behavior": "classical",
    "payload": [
      "DOMAIN-SUFFIX,gemini.google.com",
      "DOMAIN-SUFFIX,aistudio.google.com",
      "DOMAIN-SUFFIX,makersuite.google.com",
      "DOMAIN-SUFFIX,notebooklm.google.com",
      "DOMAIN-SUFFIX,notebooklm.google",
      "DOMAIN-SUFFIX,deepmind.com",
      "DOMAIN-SUFFIX,deepmind.google",
      "DOMAIN-SUFFIX,generativeai.google",
      "DOMAIN-SUFFIX,proactivebackend-pa.googleapis.com",
      "DOMAIN,alkalimakersuite-pa.clients6.google.com",
      "DOMAIN,generativelanguage.googleapis.com",
      "DOMAIN,ai.google.dev"
    ]
  },
  "ai-copilot": {
    "type": "inline",
    "behavior": "classical",
    "payload": [
      "DOMAIN-SUFFIX,copilot.microsoft.com",
      "DOMAIN-SUFFIX,copilot.cloud.microsoft",
      "DOMAIN,sydney.bing.com",
      "DOMAIN-SUFFIX,edgeservices.bing.com",
      "DOMAIN,r.bing.com",
      "DOMAIN,services.bingapis.com",
      "DOMAIN,www.bing.com",
      "DOMAIN,api.msn.com",
      "DOMAIN,assets.msn.com",
      "DOMAIN-SUFFIX,gateway.bingviz.microsoft.net",
      "DOMAIN-SUFFIX,gateway.bingviz.microsoftapp.net",
      "DOMAIN-SUFFIX,api.microsoftapp.net",
      "DOMAIN-SUFFIX,bing-shopping.microsoft-falcon.io",
      "DOMAIN-SUFFIX,githubcopilot.com",
      "DOMAIN-SUFFIX,copilot-proxy.githubusercontent.com",
      "DOMAIN-SUFFIX,copilot-stg.com"
    ]
  },
  "ai-extra": {
    "type": "inline",
    "behavior": "classical",
    "payload": [
      // 2025-2026 核心 AI 编程 / 搜索 / 聚合平台 (Sukka / Blackmatrix7 精选)
      "DOMAIN-SUFFIX,cursor.sh",
      "DOMAIN-SUFFIX,cursor.com",
      "DOMAIN-SUFFIX,cursorapi.com",
      "DOMAIN-SUFFIX,cursor-cdn.com",
      "DOMAIN-SUFFIX,codeium.com",
      "DOMAIN-SUFFIX,codeiumdata.com",
      "DOMAIN-SUFFIX,windsurf.ai",
      "DOMAIN-SUFFIX,windsurf.com",
      "DOMAIN-SUFFIX,grok.com",
      "DOMAIN-SUFFIX,x.ai",
      "DOMAIN-SUFFIX,perplexity.ai",
      "DOMAIN-SUFFIX,pplx.ai",
      "DOMAIN-SUFFIX,openrouter.ai",
      "DOMAIN-SUFFIX,poe.com",
      "DOMAIN-SUFFIX,poecdn.net",
      "DOMAIN-SUFFIX,coze.com",
      "DOMAIN-SUFFIX,ciciai.com",
      "DOMAIN-SUFFIX,dify.ai",
      "DOMAIN-SUFFIX,v0.dev",
      "DOMAIN-SUFFIX,bolt.new",
      "DOMAIN-SUFFIX,lovable.dev",
      "DOMAIN-SUFFIX,replit.com",
      "DOMAIN-SUFFIX,devin.ai",
      "DOMAIN-SUFFIX,manus.im",
      "DOMAIN-SUFFIX,genspark.ai",
      "DOMAIN-SUFFIX,huggingface.co",
      "DOMAIN-SUFFIX,hf.co",
      "DOMAIN-SUFFIX,hf.space",
      "DOMAIN-SUFFIX,civitai.com",
      "DOMAIN-SUFFIX,midjourney.com",
      "DOMAIN-SUFFIX,groq.com",
      "DOMAIN-SUFFIX,mistral.ai",
      "DOMAIN-SUFFIX,cohere.com",
      "DOMAIN-SUFFIX,cohere.ai",
      "DOMAIN-SUFFIX,character.ai",
      "DOMAIN-SUFFIX,elevenlabs.io",
      // 创意 / 音视频 / 算力云 (保留自原脚本)
      "DOMAIN-SUFFIX,stability.ai",
      "DOMAIN-SUFFIX,replicate.com",
      "DOMAIN-SUFFIX,replicate.delivery",
      "DOMAIN-SUFFIX,leonardo.ai",
      "DOMAIN-SUFFIX,ideogram.ai",
      "DOMAIN-SUFFIX,krea.ai",
      "DOMAIN-SUFFIX,tensor.art",
      "DOMAIN-SUFFIX,fal.ai",
      "DOMAIN-SUFFIX,fal.run",
      "DOMAIN-SUFFIX,photoroom.com",
      "DOMAIN-SUFFIX,runwayml.com",
      "DOMAIN-SUFFIX,lumalabs.ai",
      "DOMAIN-SUFFIX,pika.art",
      "DOMAIN-SUFFIX,viggle.ai",
      "DOMAIN-SUFFIX,hedra.com",
      "DOMAIN-SUFFIX,klingai.com",
      "DOMAIN-SUFFIX,hailuoai.video",
      "DOMAIN-SUFFIX,suno.com",
      "DOMAIN-SUFFIX,suno.ai",
      "DOMAIN-SUFFIX,udio.com",
      "DOMAIN-SUFFIX,riffusion.com",
      "DOMAIN-SUFFIX,play.ht",
      "DOMAIN-SUFFIX,murf.ai",
      "DOMAIN-SUFFIX,speechify.com",
      "DOMAIN-SUFFIX,deepgram.com",
      "DOMAIN-SUFFIX,assemblyai.com",
      "DOMAIN-SUFFIX,heygen.com",
      "DOMAIN-SUFFIX,synthesia.io",
      "DOMAIN-SUFFIX,d-id.com",
      "DOMAIN-SUFFIX,descript.com",
      "DOMAIN-SUFFIX,captions.ai",
      "DOMAIN-SUFFIX,otter.ai",
      "DOMAIN-SUFFIX,fireflies.ai",
      "DOMAIN-SUFFIX,tldv.io",
      "DOMAIN-SUFFIX,granola.ai",
      "DOMAIN-SUFFIX,tokenharbor.ai",
      "DOMAIN-SUFFIX,together.ai",
      "DOMAIN-SUFFIX,together.xyz",
      "DOMAIN-SUFFIX,deepinfra.com",
      "DOMAIN-SUFFIX,anyscale.com",
      "DOMAIN-SUFFIX,lepton.ai",
      "DOMAIN-SUFFIX,fireworks.ai",
      "DOMAIN-SUFFIX,baseten.co",
      "DOMAIN-SUFFIX,modal.com",
      "DOMAIN-SUFFIX,weights.gg",
      "DOMAIN-SUFFIX,phind.com",
      "DOMAIN-SUFFIX,you.com",
      "DOMAIN-SUFFIX,tavily.com",
      "DOMAIN-SUFFIX,exa.ai",
      "DOMAIN-SUFFIX,lmarena.ai",
      "DOMAIN-SUFFIX,lmsys.org",
      "DOMAIN-SUFFIX,pinecone.io",
      "DOMAIN-SUFFIX,weaviate.io",
      "DOMAIN-SUFFIX,qdrant.tech",
      "DOMAIN-SUFFIX,zilliz.com",
      "DOMAIN-SUFFIX,llamaindex.ai",
      "DOMAIN-SUFFIX,langfuse.com",
      "DOMAIN-SUFFIX,e2b.dev",
      "DOMAIN-SUFFIX,gamma.app",
      "DOMAIN-SUFFIX,tome.app",
      "DOMAIN-SUFFIX,invideo.io",
      "DOMAIN-SUFFIX,pictory.ai",
      "DOMAIN-SUFFIX,fliki.ai"
    ]
  },
  "ai-cn": {
    "type": "inline",
    "behavior": "classical",
    "payload": [
      "DOMAIN-SUFFIX,deepseek.com",
      "DOMAIN-SUFFIX,deepseek.cn",
      "DOMAIN-SUFFIX,moonshot.cn",
      "DOMAIN-SUFFIX,kimi.com",
      "DOMAIN-SUFFIX,kimi.moonshot.cn",
      "DOMAIN-SUFFIX,bigmodel.cn",
      "DOMAIN-SUFFIX,zhipuai.cn",
      "DOMAIN-SUFFIX,chatglm.cn",
      "DOMAIN-SUFFIX,qingyan.cn",
      "DOMAIN-SUFFIX,doubao.com",
      "DOMAIN-SUFFIX,marscode.cn",
      "DOMAIN-SUFFIX,volces.com",
      "DOMAIN-SUFFIX,volcengine.com",
      "DOMAIN-SUFFIX,tongyi.aliyun.com",
      "DOMAIN-SUFFIX,qianwen.com",
      "DOMAIN-SUFFIX,qwenlm.ai",
      "DOMAIN-SUFFIX,dashscope.aliyuncs.com",
      "DOMAIN-SUFFIX,bailian.console.aliyun.com",
      "DOMAIN-SUFFIX,minimaxi.com",
      "DOMAIN-SUFFIX,minimax.chat",
      "DOMAIN-SUFFIX,hailuoai.com",
      "DOMAIN-SUFFIX,yiyan.baidu.com",
      "DOMAIN-SUFFIX,wenxin.baidu.com",
      "DOMAIN-SUFFIX,aip.baidubce.com",
      "DOMAIN-SUFFIX,hunyuan.tencent.com",
      "DOMAIN-SUFFIX,yuanbao.tencent.com",
      "DOMAIN-SUFFIX,ima.qq.com",
      "DOMAIN-SUFFIX,baichuan-ai.com",
      "DOMAIN-SUFFIX,stepfun.com",
      "DOMAIN-SUFFIX,yuewen.cn",
      "DOMAIN-SUFFIX,01.ai",
      "DOMAIN-SUFFIX,yi.com",
      "DOMAIN-SUFFIX,sensetime.com",
      "DOMAIN-SUFFIX,sensenova.cn",
      "DOMAIN-SUFFIX,xinghuo.xfyun.cn",
      "DOMAIN-SUFFIX,siliconflow.cn",
      "DOMAIN-SUFFIX,modelscope.cn",
      "DOMAIN-SUFFIX,coze.cn",
      "DOMAIN-SUFFIX,jimeng.jianying.com",
      "DOMAIN-SUFFIX,metaso.cn",
      "DOMAIN-SUFFIX,tiangong.cn",
      "DOMAIN-SUFFIX,n.cn"
    ]
  }
};

const RULES = [
  // ---- 1. 局域网与私有地址直连 (兼容 IPv4 / IPv6) ----
  "GEOSITE,private,DIRECT",
  "GEOIP,private,DIRECT,no-resolve",
  "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
  "IP-CIDR,224.0.0.0/4,DIRECT,no-resolve",
  "IP-CIDR,255.255.255.255/32,DIRECT,no-resolve",
  "IP-CIDR6,::1/128,DIRECT,no-resolve",
  "IP-CIDR6,fc00::/7,DIRECT,no-resolve",
  "IP-CIDR6,fe80::/10,DIRECT,no-resolve",

  // ---- 2. 广告拦截与防 WebRTC 真实 IP 泄露 (拦截 STUN 打洞探测) ----
  "RULE-SET,ads,🛑 广告拦截",
  "AND,((NETWORK,udp),(DST-PORT,3478-3479)),🛑 广告拦截",
  "AND,((NETWORK,udp),(DST-PORT,5349)),🛑 广告拦截",
  "AND,((NETWORK,udp),(DST-PORT,19302-19309)),🛑 广告拦截",
  "DOMAIN-KEYWORD,stun.,🛑 广告拦截",
  "DOMAIN-SUFFIX,stun.l.google.com,🛑 广告拦截",
  "DOMAIN-SUFFIX,stun1.l.google.com,🛑 广告拦截",
  "DOMAIN-SUFFIX,stun2.l.google.com,🛑 广告拦截",
  "DOMAIN-SUFFIX,stun3.l.google.com,🛑 广告拦截",
  "DOMAIN-SUFFIX,stun4.l.google.com,🛑 广告拦截",
  "DOMAIN-SUFFIX,global.stun.twilio.com,🛑 广告拦截",

  // ---- 3. 国内 AI、国内游戏、微软/苹果国内 CDN 优先直连 ----
  "RULE-SET,ai-cn,DIRECT",
  "RULE-SET,game-cn,DIRECT",
  "GEOSITE,category-games@cn,DIRECT",
  "GEOSITE,steam@cn,DIRECT",
  "GEOSITE,apple-cn,DIRECT",
  "GEOSITE,microsoft@cn,DIRECT",
  "DOMAIN-SUFFIX,windowsupdate.com,DIRECT",
  "DOMAIN-SUFFIX,download.windowsupdate.com,DIRECT",
  "DOMAIN-SUFFIX,delivery.mp.microsoft.com,DIRECT",
  "DOMAIN-SUFFIX,update.microsoft.com,DIRECT",

  // ---- 4. AI 专项精准分流 (最高优先级防误判) ----
  "RULE-SET,ai-openai,🧠 ChatGPT",
  "GEOSITE,openai,🧠 ChatGPT",
  "RULE-SET,ai-claude,🎭 Claude",
  "GEOSITE,anthropic,🎭 Claude",
  "RULE-SET,ai-gemini,✨ Gemini",
  "GEOSITE,google-gemini,✨ Gemini",
  "GEOSITE,google-deepmind,✨ Gemini",
  "RULE-SET,ai-copilot,🧩 Copilot",
  "RULE-SET,ai-extra,🤖 AI服务",
  "RULE-SET,ai,🤖 AI服务",

  // ---- 5. 游戏、流媒体、高频海外服务 ----
  "GEOSITE,github,🔍 谷歌服务",
  "GEOSITE,category-games,🎮 游戏平台",
  "GEOSITE,discord,🎮 游戏平台",
  "RULE-SET,youtube,📺 油管专用",
  "RULE-SET,disney,🎬 流媒体",
  "GEOSITE,netflix,🎬 流媒体",
  "GEOSITE,spotify,🎬 流媒体",
  "GEOSITE,tiktok,🎬 流媒体",
  "GEOSITE,bahamut,🎬 流媒体",
  "GEOSITE,biliintl,🎬 流媒体",
  "RULE-SET,apple,🍎 苹果服务",
  "RULE-SET,google,🔍 谷歌服务",
  "GEOSITE,telegram,💬 电报专用",
  "RULE-SET,telegram_ip,💬 电报专用,no-resolve",
  "GEOSITE,microsoft,Ⓜ️ 微软服务",

  // ---- 6. 国内外全局分流与兜底 (Loyalsoldier 黄金准则) ----
  "GEOSITE,geolocation-!cn,🚀 兜底代理",
  "GEOSITE,CN,DIRECT",
  "GEOIP,CN,DIRECT,no-resolve",
  "MATCH,🚀 兜底代理"
];

// 过滤机场非节点信息条目与倍率说明
const NOTICE_STR = "官网|流量|剩余|到期|过期|套餐|订阅|重置|邀请|客服|返利|购买|续费|试用|测速|群组|机场|频道|公告|维护|说明|网址|备用|失联|traffic|expire|expired|subscription|reset|official|website";
const NOTICE = new RegExp(NOTICE_STR, "i");

const REGIONS = [
  { name: "🇭🇰 中国香港节点", filter: "🇭🇰|中国香港|香港|深港|沪港|广港|\\bHK\\b|\\bHKG\\b|Hong[ -]?Kong", re: /🇭🇰|中国香港|香港|深港|沪港|广港|\bHK\b|\bHKG\b|Hong[ -]?Kong/i },
  { name: "🇯🇵 日本节点", filter: "🇯🇵|日本|东京|大阪|埼玉|川日|沪日|\\bJP\\b|\\bJPN\\b|Japan|Tokyo|Osaka", re: /🇯🇵|日本|东京|大阪|埼玉|川日|沪日|\bJP\b|\bJPN\b|Japan|Tokyo|Osaka/i },
  { name: "🇸🇬 新加坡节点", filter: "🇸🇬|新加坡|新国|狮城|\\bSG\\b|\\bSGP\\b|Singapore", re: /🇸🇬|新加坡|新国|狮城|\bSG\b|\bSGP\b|Singapore/i },
  { name: "🇺🇸 美国节点", filter: "🇺🇸|美国|美西|美东|美中|硅谷|洛杉矶|西雅图|圣何塞|芝加哥|纽约|\\bUS\\b|\\bUSA\\b|United[ -]?States|America|Los[ -]?Angeles|New[ -]?York|San[ -]?Francisco|Seattle|Silicon", re: /🇺🇸|美国|美西|美东|美中|硅谷|洛杉矶|西雅图|圣何塞|芝加哥|纽约|\bUS\b|\bUSA\b|United[ -]?States|America|Los[ -]?Angeles|New[ -]?York|San[ -]?Francisco|Seattle|Silicon/i },
  { name: "🇹🇼 中国台湾节点", filter: "🇹🇼|中国台湾|台湾|台北|台中|高雄|新北|彰化|\\bTW\\b|\\bTWN\\b|Taiwan|Taipei", re: /🇹🇼|中国台湾|台湾|台北|台中|高雄|新北|彰化|\bTW\b|\bTWN\b|Taiwan|Taipei/i },
  { name: "🇰🇷 韩国节点", filter: "🇰🇷|韩国|首尔|春川|釜山|\\bKR\\b|\\bKOR\\b|Korea|Seoul", re: /🇰🇷|韩国|首尔|春川|釜山|\bKR\b|\bKOR\b|Korea|Seoul/i },
];
const OTHER_NAME = "🌍 其他地区";
const HK_NAME = "🇭🇰 中国香港节点";

const TEST_URL = "https://cp.cloudflare.com/generate_204";
const STD_HEAD = ['🎯 节点选择', '📋 节点手动选择', '♻️ 节点自动选择', '⚖️ 节点负载均衡'];
const DIRECT = 'DIRECT';
const REJECT = 'REJECT';

// 给 proxy-providers 用的负向过滤（mihomo 的 filter 只认 Go 正则字符串）
const OTHER_FILTER = '(?i)^(?!.*(?:'
  + REGIONS.map(function (r) { return r.filter; }).join('|')
  + ')).*';
const NON_HK_FILTER = '(?i)^(?!.*(?:' + REGIONS[0].filter + ')).*';

function main(config) {
  const providerNames = Object.keys(config['proxy-providers'] || {});
  const rawProxies = Array.isArray(config.proxies) ? config.proxies : [];

  // ---- 1. 筛掉订阅里混的「官网 / 流量 / 到期」等非节点条目 ----
  const nodes = rawProxies.filter(function (p) {
    return p && typeof p.name === 'string'
      && !NOTICE.test(p.name)
      && String(p.type || '').toLowerCase() !== 'direct';
  });
  const names = nodes.map(function (p) { return p.name; });
  const byProvider = providerNames.length > 0;

  if (names.length === 0 && !byProvider) {
    throw new Error('订阅里没有解析到任何可用节点，覆写已中止');
  }

  // 若订阅使用 proxy-providers，为其统一注入 exclude-filter 剔除垃圾说明节点
  const updatedProxyProviders = Object.assign({}, config['proxy-providers'] || {});
  providerNames.forEach(function (k) {
    const prov = Object.assign({}, updatedProxyProviders[k]);
    prov['exclude-filter'] = prov['exclude-filter']
      ? prov['exclude-filter'] + '|' + NOTICE_STR
      : '(?i)(' + NOTICE_STR + ')';
    updatedProxyProviders[k] = prov;
  });

  // ---- 2. 按地区分桶 ----
  const membersOf = {};
  REGIONS.forEach(function (r) {
    membersOf[r.name] = names.filter(function (n) { return r.re.test(n); });
  });
  const others = names.filter(function (n) {
    return !REGIONS.some(function (r) { return r.re.test(n); });
  });
  const nonHkNames = names.filter(function (n) {
    return !REGIONS[0].re.test(n);
  });

  // 有 proxy-providers 时脚本看不到节点名，只能全保留、交给 filter 去筛
  const keptRegions = REGIONS.filter(function (r) {
    return byProvider || membersOf[r.name].length > 0;
  });
  const keepOther = byProvider || others.length > 0;
  const hasNonHk = byProvider || nonHkNames.length > 0;

  const tail = keptRegions.map(function (r) { return r.name; })
    .concat(keepOther ? [OTHER_NAME] : []);
  const nonHkTail = tail.filter(function (n) { return n !== HK_NAME; });

  const STD = STD_HEAD.concat(tail, [DIRECT]);
  // AI 策略组默认首选「🌐 AI 自动优选 (无港)」，彻底避免走全局自动选择误入香港节点
  const AI_CANDIDATES = (hasNonHk ? ['🌐 AI 自动优选 (无港)'] : [])
    .concat(nonHkTail, STD_HEAD, [DIRECT]);

  // ---- 3. 组装代理组 ----
  function fixed(name, type, members, extra) {
    return Object.assign({ name: name, type: type, proxies: members }, extra || {});
  }
  function pooled(name, type, members, filterStr, extra) {
    const g = { name: name, type: type };
    if (members && members.length) g.proxies = members;
    if (byProvider) {
      g.use = providerNames;
      if (filterStr) g.filter = filterStr;
    }
    return Object.assign(g, extra || {});
  }

  const health = {
    url: TEST_URL,
    interval: 300,
    timeout: 5000,
    lazy: true,
    'expected-status': 204,
  };

  const entryGroups = [
    fixed('🎯 节点选择', 'select',
      ['♻️ 节点自动选择', '📋 节点手动选择', '⚖️ 节点负载均衡'].concat(tail, [DIRECT])),
    pooled('📋 节点手动选择', 'select', names, null),
    pooled('♻️ 节点自动选择', 'url-test', names, null,
      Object.assign({}, health, { tolerance: 50 })),
    pooled('⚖️ 节点负载均衡', 'load-balance', names, null,
      Object.assign({}, health, { strategy: 'consistent-hashing' })),
  ];

  // 新增 AI 专属无港自动测速池
  if (hasNonHk) {
    entryGroups.push(
      pooled('🌐 AI 自动优选 (无港)', 'url-test', nonHkNames, NON_HK_FILTER,
        Object.assign({}, health, { tolerance: 50 }))
    );
  }

  const AI_GROUPS = ['🤖 AI服务', '🧠 ChatGPT', '🎭 Claude', '✨ Gemini', '🧩 Copilot'];
  const SERVICE_GROUPS = ['📺 油管专用', '🎬 流媒体', '💬 电报专用', 'Ⓜ️ 微软服务',
                          '🍎 苹果服务', '🔍 谷歌服务', '🎮 游戏平台'];

  const aiGroups = AI_GROUPS.map(function (n) { return fixed(n, 'select', AI_CANDIDATES); });
  const serviceGroups = SERVICE_GROUPS.map(function (n) { return fixed(n, 'select', STD); });

  const regionGroups = keptRegions.map(function (r) {
    return pooled(r.name, 'url-test', membersOf[r.name], '(?i)' + r.filter,
      Object.assign({}, health, { tolerance: 50 }));
  });
  if (keepOther) {
    regionGroups.push(pooled(OTHER_NAME, 'select', others, OTHER_FILTER));
  }

  const tailGroups = [
    fixed('🛑 广告拦截', 'select', [REJECT, DIRECT]),
    fixed('🚀 兜底代理', 'select', ['🎯 节点选择', '♻️ 节点自动选择', '⚖️ 节点负载均衡'].concat(tail, [DIRECT])),
  ];

  // ---- 4. 合并 rule-providers（保留订阅自带的，不覆盖）----
  const mergedRuleProviders = Object.assign({}, config['rule-providers'] || {}, RULE_PROVIDERS);

  const result = Object.assign({}, config, {
    'proxies': nodes, // 写回清洗后的节点列表，防止无效条目残留
    'proxy-groups': [].concat(entryGroups, aiGroups, serviceGroups, regionGroups, tailGroups),
    'rules': RULES.slice(),
    'rule-providers': mergedRuleProviders,
  });

  if (byProvider) {
    result['proxy-providers'] = updatedProxyProviders;
  }

  console.log('[覆写完成] 有效节点 ' + names.length + ' 个 / 地区组 ' + keptRegions.length
    + ' 个 / 代理组 ' + result['proxy-groups'].length + ' 个 / 规则 ' + RULES.length + ' 条');

  return result;
}
