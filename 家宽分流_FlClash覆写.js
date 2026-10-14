/* ============================================================
 * 家宽节点基础分流 —— FlClash 脚本覆写版（纯分流）
 *
 * 对应文件：家宽分流.yaml（桌面）
 * 适用：FlClash（mihomo 内核）
 *
 * 【这个脚本只做什么】
 *   只注入 rules（16 条分流规则）和 rule-providers（13 个规则集）。
 *   proxy-groups / proxies / proxy-providers 一律不碰 ——
 *   节点与分组由订阅自己提供，规则命中它自带的「🚀 节点选择」组。
 *
 * 【前提】订阅配置里必须有名为「🚀 节点选择」的代理组，
 *   否则启动报错（rules 的目标指向不存在的组）。
 *   导入后建议点「预览」确认组名存在。
 *
 * 【怎么用】
 *   1. FlClash → 配置 → 右上角菜单 → 脚本 → 新建
 *   2. 把本文件全部内容粘进去，保存
 *   3. 回到「配置」→ 目标订阅右上角 ⋮ → 覆写
 *   4. 顶部模式选「脚本」，然后在脚本列表里选中刚建的这个
 *   5. 点右上角「预览」可以看生成的配置对不对
 *
 * 【添加自定义分流】
 *   在下面 RULES 数组的 MATCH 行之前插入一行：
 *     "DOMAIN-SUFFIX,example.com,🚀 节点选择"   走代理
 *     "DOMAIN-SUFFIX,example.cn,DIRECT"         直连
 *     "DOMAIN-SUFFIX,ads.com,REJECT"            拦截
 *   规则从上往下匹配，越具体的放越前面。
 * ============================================================ */

// ---- 规则集定义（从 家宽分流.yaml 原样搬运）----
const RULE_PROVIDERS = {
  "reject": {
    "type": "http",
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
    "path": "./ruleset/reject.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "icloud": {
    "type": "http",
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
    "path": "./ruleset/icloud.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "apple": {
    "type": "http",
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
    "path": "./ruleset/apple.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "google": {
    "type": "http",
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
    "path": "./ruleset/google.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "proxy": {
    "type": "http",
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
    "path": "./ruleset/proxy.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "direct": {
    "type": "http",
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt",
    "path": "./ruleset/direct.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "private": {
    "type": "http",
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
    "path": "./ruleset/private.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "gfw": {
    "type": "http",
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
    "path": "./ruleset/gfw.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "tld-not-cn": {
    "type": "http",
    "behavior": "domain",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
    "path": "./ruleset/tld-not-cn.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "telegramcidr": {
    "type": "http",
    "behavior": "ipcidr",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
    "path": "./ruleset/telegramcidr.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "cncidr": {
    "type": "http",
    "behavior": "ipcidr",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
    "path": "./ruleset/cncidr.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "lancidr": {
    "type": "http",
    "behavior": "ipcidr",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
    "path": "./ruleset/lancidr.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  },
  "applications": {
    "type": "http",
    "behavior": "classical",
    "url": "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
    "path": "./ruleset/applications.yaml",
    "interval": 86400,
    "proxy": "DIRECT"
  }
};

// ---- 分流规则（从 家宽分流.yaml 原样搬运）----
// 顺序即优先级，从上往下命中即停。MATCH 必须是最后一行。
const RULES = [
  "RULE-SET,applications,DIRECT",
  "DOMAIN,clash.razord.top,DIRECT",
  "DOMAIN,yacd.haishan.me,DIRECT",
  "RULE-SET,private,DIRECT",
  "RULE-SET,reject,REJECT",
  "RULE-SET,icloud,DIRECT",
  "RULE-SET,apple,DIRECT",
  "RULE-SET,google,🚀 节点选择",
  "RULE-SET,proxy,🚀 节点选择",
  "RULE-SET,direct,DIRECT",
  "RULE-SET,lancidr,DIRECT",
  "RULE-SET,cncidr,DIRECT",
  "RULE-SET,telegramcidr,🚀 节点选择",
  "GEOIP,LAN,DIRECT",
  "GEOIP,CN,DIRECT",
  "MATCH,🚀 节点选择"
];

// 规则目标不在订阅分组里时的回调（测试用，生产环境忽略）
const WARN = function (msg) { console.log(msg); };

function main(config) {
  config = config || {};

  // ---- 1. 校验规则引用的组名是否存在于订阅 ----
  // 只告警不创建、不修改——分组完全由订阅负责。
  var groups = Array.isArray(config["proxy-groups"]) ? config["proxy-groups"] : [];
  var groupNames = {};
  groups.forEach(function (g) {
    if (g && typeof g.name === "string") groupNames[g.name] = true;
  });

  function targetOf(rule) {
    var parts = rule.split(",");
    var type = parts[0];
    if (type === "MATCH") return parts[1];
    if (type === "RULE-SET" || type === "GEOIP" || type === "GEOSITE"
      || type === "IP-CIDR" || type === "IP-CIDR6"
      || type === "DOMAIN" || type === "DOMAIN-SUFFIX" || type === "DOMAIN-KEYWORD") {
      return parts[2];
    }
    return null;
  }

  var missing = [];
  RULES.forEach(function (r) {
    var t = targetOf(r);
    if (t && t !== "DIRECT" && t !== "REJECT" && !groupNames[t]) {
      if (missing.indexOf(t) === -1) missing.push(t);
    }
  });
  if (missing.length > 0) {
    WARN("[覆写警告] 规则引用了订阅里不存在的组：" + missing.join("、")
      + "。请确认订阅包含「🚀 节点选择」组，否则客户端启动报错。");
  }

  // ---- 2. 校验 RULE-SET 引用的 provider 是否都已定义 ----
  // provider 以本脚本为准（跟 YAML 的同名会覆盖），所以理论上不缺
  var providerKeys = Object.keys(RULE_PROVIDERS);
  RULES.forEach(function (r) {
    var parts = r.split(",");
    if (parts[0] === "RULE-SET" && providerKeys.indexOf(parts[1]) === -1) {
      WARN("[覆写警告] 规则引用了未定义的规则集：" + parts[1]);
    }
  });

  // ---- 3. 合并 rule-providers：保留订阅自带的，同名以本脚本为准 ----
  var merged = Object.assign({}, config["rule-providers"] || {});
  Object.keys(RULE_PROVIDERS).forEach(function (k) {
    merged[k] = RULE_PROVIDERS[k];
  });

  // ---- 4. 只替换 rules，其它一律原样返回 ----
  // proxy-groups / proxies / proxy-providers / tun / dns / 其它字段不动
  WARN("[覆写] 注入规则 " + RULES.length + " 条 / 规则集 " + providerKeys.length
    + " 个；分组与节点未做任何改动");

  var out = Object.assign({}, config);
  out.rules = RULES.slice();
  out["rule-providers"] = merged;
  return out;
}
