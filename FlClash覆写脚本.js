/* ============================================================
 * Clash 完美分流 · AI 强化版 —— FlClash 脚本覆写版
 *
 * 对应文件：Clash_可维护.yaml（唯一真源，桌面 → 分流规则文件 目录）
 * 适用：FlClash（mihomo 内核）
 *
 * 【为什么需要这个脚本】
 *   FlClash 的「覆写 → 脚本」只接受 JavaScript，不吃 YAML。
 *   把 Clash Verge 的 YAML 扩展配置直接粘进去，会得到：
 *       invalid first character of private name at eval_script:1:1
 *   （YAML 第一行的 '#' 被当成 JS 的私有字段标记符了）
 *   所以这份配置在这里被重写成 main(config) 形式的 JS。
 *
 * 【怎么用】
 *   1. FlClash → 配置 → 右上角菜单 → 脚本 → 新建
 *   2. 把本文件全部内容粘进去，保存
 *   3. 回到「配置」→ 目标订阅右上角 ⋮ → 覆写
 *   4. 顶部模式选「脚本」，然后在脚本列表里选中刚建的这个
 *   5. 点右上角「预览」可以看生成的配置对不对
 *
 * 【移植范围】只替换 proxy-groups / rules / rule-providers。
 *   tun 与 dns 一律不动 —— 这两项交给 FlClash 自己的界面管，
 *   脚本里覆盖会和界面设置互相打架。
 *
 * 【与 Windows 版的差异】
 *   - 删掉了 PROCESS-NAME-WILDCARD 那组进程规则：里面全是 Windows 进程名，
 *     安卓无意义（安卓按包名匹配，且 FlClash 无 root 时不可靠）。
 *     游戏本体的裸 IP / P2P 连接在安卓上只能靠 GEOIP 兜底。
 *   - 地区组若在订阅里一个节点都没匹配到，会自动省略（避免空组报错），
 *     同时自动从其它组的候选列表里摘掉，不会留下悬空引用。
 *   - 订阅用 proxy-providers 而不是内联 proxies 时，脚本会改用
 *     use + filter 的方式筛选，同样能正常工作。
 *
 * 数据段（RULE_PROVIDERS / RULES / REGIONS / NOTICE / TEST_URL）
 * 由「生成FlClash覆写脚本.py」从 Clash_可维护.yaml 自动提取，
 * 保证与 Windows 版逐字节一致。改完 YAML 请重跑那个脚本，不要手改本文件。
 * ============================================================ */

const RULE_PROVIDERS = {
  "ads": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "interval": 86400,
    "proxy": "DIRECT",
    "url": "https://cdn.jsdelivr.net/gh/n0de-sudo/Perfect-Rules@main/Clash/rules/ads.yaml"
  },
  "ai": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "interval": 86400,
    "proxy": "DIRECT",
    "url": "https://cdn.jsdelivr.net/gh/n0de-sudo/Perfect-Rules@main/Clash/rules/ai.yaml"
  },
  "youtube": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "interval": 86400,
    "proxy": "DIRECT",
    "url": "https://cdn.jsdelivr.net/gh/n0de-sudo/Perfect-Rules@main/Clash/rules/youtube.yaml"
  },
  "disney": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "interval": 86400,
    "proxy": "DIRECT",
    "url": "https://cdn.jsdelivr.net/gh/n0de-sudo/Perfect-Rules@main/Clash/rules/disney.yaml"
  },
  "apple": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "interval": 86400,
    "proxy": "DIRECT",
    "url": "https://cdn.jsdelivr.net/gh/n0de-sudo/Perfect-Rules@main/Clash/rules/apple.yaml"
  },
  "google": {
    "type": "http",
    "behavior": "classical",
    "format": "yaml",
    "interval": 86400,
    "proxy": "DIRECT",
    "url": "https://cdn.jsdelivr.net/gh/n0de-sudo/Perfect-Rules@main/Clash/rules/google.yaml"
  },
  "game-cn": {
    "type": "inline",
    "behavior": "classical",
    "payload": [
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
      "DOMAIN-SUFFIX,mihoyomall.com",
      "DOMAIN-SUFFIX,mihoyogift.com",
      "DOMAIN-SUFFIX,mihoyocg.com",
      "DOMAIN-SUFFIX,wanmei.com",
      "DOMAIN-SUFFIX,wmsj.cn",
      "DOMAIN-SUFFIX,sdo.com",
      "DOMAIN-SUFFIX,yostar.cn",
      "DOMAIN-SUFFIX,leagueoflegends.cn",
      "DOMAIN-SUFFIX,lpl.com.cn",
      "DOMAIN-SUFFIX,bluearchive-cn.com",
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
      "DOMAIN-SUFFIX,kimi.moonshot.cn",
      "DOMAIN-SUFFIX,bigmodel.cn",
      "DOMAIN-SUFFIX,zhipuai.cn",
      "DOMAIN-SUFFIX,chatglm.cn",
      "DOMAIN-SUFFIX,doubao.com",
      "DOMAIN-SUFFIX,volces.com",
      "DOMAIN-SUFFIX,volcengine.com",
      "DOMAIN-SUFFIX,tongyi.aliyun.com",
      "DOMAIN-SUFFIX,qianwen.com",
      "DOMAIN-SUFFIX,dashscope.aliyuncs.com",
      "DOMAIN-SUFFIX,bailian.console.aliyun.com",
      "DOMAIN-SUFFIX,minimaxi.com",
      "DOMAIN-SUFFIX,minimax.chat",
      "DOMAIN-SUFFIX,hailuoai.com",
      "DOMAIN-SUFFIX,yiyan.baidu.com",
      "DOMAIN-SUFFIX,wenxin.baidu.com",
      "DOMAIN-SUFFIX,aip.baidubce.com",
      "DOMAIN-SUFFIX,hunyuan.tencent.com",
      "DOMAIN-SUFFIX,baichuan-ai.com",
      "DOMAIN-SUFFIX,stepfun.com",
      "DOMAIN-SUFFIX,01.ai",
      "DOMAIN-SUFFIX,sensetime.com",
      "DOMAIN-SUFFIX,sensenova.cn",
      "DOMAIN-SUFFIX,xinghuo.xfyun.cn",
      "DOMAIN-SUFFIX,siliconflow.cn",
      "DOMAIN-SUFFIX,modelscope.cn",
      "DOMAIN-SUFFIX,coze.cn",
      "DOMAIN-SUFFIX,jimeng.jianying.com"
    ]
  }
};

const RULES = [
  "GEOSITE,private,DIRECT",
  "GEOIP,private,DIRECT,no-resolve",
  "IP-CIDR,127.0.0.0/8,DIRECT,no-resolve",
  "IP-CIDR,224.0.0.0/4,DIRECT,no-resolve",
  "IP-CIDR,255.255.255.255/32,DIRECT,no-resolve",
  "RULE-SET,ads,🛑 广告拦截",
  "RULE-SET,ai-cn,DIRECT",
  "RULE-SET,game-cn,DIRECT",
  "GEOSITE,category-games,🎮 游戏平台",
  "GEOSITE,discord,🎮 游戏平台",
  "GEOSITE,apple-cn,DIRECT",
  "GEOSITE,microsoft@cn,DIRECT",
  "DOMAIN-SUFFIX,windowsupdate.com,DIRECT",
  "DOMAIN-SUFFIX,download.windowsupdate.com,DIRECT",
  "DOMAIN-SUFFIX,delivery.mp.microsoft.com,DIRECT",
  "DOMAIN-SUFFIX,update.microsoft.com,DIRECT",
  "RULE-SET,ai-openai,🧠 ChatGPT",
  "GEOSITE,openai,🧠 ChatGPT",
  "GEOSITE,anthropic,🎭 Claude",
  "GEOSITE,google-gemini,✨ Gemini",
  "GEOSITE,google-deepmind,✨ Gemini",
  "RULE-SET,ai-copilot,🧩 Copilot",
  "RULE-SET,ai-extra,🤖 AI服务",
  "RULE-SET,ai,🤖 AI服务",
  "IP-CIDR,160.79.104.0/21,🎭 Claude,no-resolve",
  "RULE-SET,youtube,📺 油管专用",
  "RULE-SET,disney,🎬 流媒体",
  "GEOSITE,netflix,🎬 流媒体",
  "GEOSITE,spotify,🎬 流媒体",
  "GEOSITE,tiktok,🎬 流媒体",
  "RULE-SET,apple,🍎 苹果服务",
  "RULE-SET,google,🔍 谷歌服务",
  "GEOSITE,telegram,💬 电报专用",
  "GEOSITE,microsoft,Ⓜ️ 微软服务",
  "GEOSITE,CN,DIRECT",
  "GEOIP,CN,DIRECT,no-resolve",
  "MATCH,🚀 兜底代理"
];

const NOTICE = /官网|流量|剩余|到期|过期|套餐|订阅|重置|邀请|客服|返利|购买|续费|试用|测速|群组|机场|traffic|expire|expired|subscription|reset|official|website/i;

const REGIONS = [
  { name: "🇭🇰 中国香港节点", filter: "🇭🇰|中国香港|香港|港|\\bHK\\b|\\bHKG\\b|Hong[ -]?Kong", re: /🇭🇰|中国香港|香港|港|\bHK\b|\bHKG\b|Hong[ -]?Kong/i },
  { name: "🇯🇵 日本节点", filter: "🇯🇵|日本|日|\\bJP\\b|\\bJPN\\b|Japan|Tokyo|Osaka", re: /🇯🇵|日本|日|\bJP\b|\bJPN\b|Japan|Tokyo|Osaka/i },
  { name: "🇸🇬 新加坡节点", filter: "🇸🇬|新加坡|新国|\\bSG\\b|\\bSGP\\b|Singapore", re: /🇸🇬|新加坡|新国|\bSG\b|\bSGP\b|Singapore/i },
  { name: "🇺🇸 美国节点", filter: "🇺🇸|美国|美|\\bUS\\b|\\bUSA\\b|United[ -]?States|America|Los[ -]?Angeles|New[ -]?York|San[ -]?Francisco", re: /🇺🇸|美国|美|\bUS\b|\bUSA\b|United[ -]?States|America|Los[ -]?Angeles|New[ -]?York|San[ -]?Francisco/i },
  { name: "🇨🇳 中国台湾节点", filter: "🇹🇼|中国台湾|台湾|台|\\bTW\\b|\\bTWN\\b|Taiwan|Taipei", re: /🇹🇼|中国台湾|台湾|台|\bTW\b|\bTWN\b|Taiwan|Taipei/i },
  { name: "🇰🇷 韩国节点", filter: "🇰🇷|韩国|韩|\\bKR\\b|\\bKOR\\b|Korea|Seoul|首尔", re: /🇰🇷|韩国|韩|\bKR\b|\bKOR\b|Korea|Seoul|首尔/i },
];
const OTHER_NAME = "🌍 其他地区";
const HK_NAME = "🇭🇰 中国香港节点";

const TEST_URL = "https://cp.cloudflare.com/generate_204";
const STD_HEAD = ['🎯 节点选择', '📋 节点手动选择', '♻️ 节点自动选择', '⚖️ 节点负载均衡'];
const DIRECT = 'DIRECT';
const REJECT = 'REJECT';

// 给 proxy-providers 用的「其他地区」负向过滤（mihomo 的 filter 只认字符串）
const OTHER_FILTER = '(?i)^(?!.*(?:'
  + REGIONS.map(function (r) { return r.filter; }).join('|')
  + ')).*';

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

  // ---- 2. 按地区分桶 ----
  const membersOf = {};
  REGIONS.forEach(function (r) {
    membersOf[r.name] = names.filter(function (n) { return r.re.test(n); });
  });
  const others = names.filter(function (n) {
    return !REGIONS.some(function (r) { return r.re.test(n); });
  });

  // 有 proxy-providers 时脚本看不到节点名，只能全保留、交给 filter 去筛
  const keptRegions = REGIONS.filter(function (r) {
    return byProvider || membersOf[r.name].length > 0;
  });
  const keepOther = byProvider || others.length > 0;

  const tail = keptRegions.map(function (r) { return r.name; })
    .concat(keepOther ? [OTHER_NAME] : []);
  const STD = STD_HEAD.concat(tail, [DIRECT]);
  const AI = STD_HEAD.concat(
    tail.filter(function (n) { return n !== HK_NAME; }), [DIRECT]);

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
    lazy: true,
    'expected-status': 204,
  };

  const entryGroups = [
    fixed('🎯 节点选择', 'select',
      ['📋 节点手动选择', '♻️ 节点自动选择', '⚖️ 节点负载均衡'].concat(tail, [DIRECT])),
    pooled('📋 节点手动选择', 'select', names, null),
    pooled('♻️ 节点自动选择', 'url-test', names, null,
      Object.assign({}, health, { tolerance: 50 })),
    pooled('⚖️ 节点负载均衡', 'load-balance', names, null,
      Object.assign({}, health, { strategy: 'consistent-hashing' })),
  ];

  const AI_GROUPS = ['🤖 AI服务', '🧠 ChatGPT', '🎭 Claude', '✨ Gemini', '🧩 Copilot'];
  const SERVICE_GROUPS = ['📺 油管专用', '🎬 流媒体', '💬 电报专用', 'Ⓜ️ 微软服务',
                          '🍎 苹果服务', '🔍 谷歌服务', '🎮 游戏平台'];

  const aiGroups = AI_GROUPS.map(function (n) { return fixed(n, 'select', AI); });
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
    // 候选列表由生成器从 YAML 直接搬过来 —— 只给 MATCH 兜底用
    fixed('🚀 兜底代理', 'select', ["🎯 节点选择", "♻️ 节点自动选择", "⚖️ 节点负载均衡", DIRECT]),
  ];

  // ---- 4. 合并 rule-providers（保留订阅自带的，不覆盖）----
  const merged = Object.assign({}, config['rule-providers'] || {}, RULE_PROVIDERS);

  console.log('[覆写] 节点 ' + names.length + ' 个 / 地区组 ' + keptRegions.length
    + ' 个 / 代理组 ' + (entryGroups.length + aiGroups.length + serviceGroups.length
    + regionGroups.length + tailGroups.length) + ' 个 / 规则 ' + RULES.length + ' 条');

  return Object.assign({}, config, {
    'proxy-groups': [].concat(entryGroups, aiGroups, serviceGroups, regionGroups, tailGroups),
    rules: RULES.slice(),
    'rule-providers': merged,
  });
}
