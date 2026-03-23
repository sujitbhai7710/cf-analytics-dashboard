/**
 * Bot Detection and Analysis
 * 
 * Analyzes traffic data to identify bots vs human traffic
 */

// Known bot patterns with their types
export const KNOWN_BOTS = [
  // Search Engine Bots
  { pattern: /googlebot/i, name: 'Googlebot', type: 'search_engine' },
  { pattern: /bingbot/i, name: 'Bingbot', type: 'search_engine' },
  { pattern: /slurp/i, name: 'Yahoo Slurp', type: 'search_engine' },
  { pattern: /duckduckbot/i, name: 'DuckDuckGo', type: 'search_engine' },
  { pattern: /baiduspider/i, name: 'Baidu', type: 'search_engine' },
  { pattern: /yandexbot/i, name: 'Yandex', type: 'search_engine' },
  
  // Social Media Bots
  { pattern: /facebookexternalhit/i, name: 'Facebook', type: 'social' },
  { pattern: /twitterbot/i, name: 'Twitter', type: 'social' },
  { pattern: /linkedinbot/i, name: 'LinkedIn', type: 'social' },
  { pattern: /pinterest/i, name: 'Pinterest', type: 'social' },
  { pattern: /whatsapp/i, name: 'WhatsApp', type: 'social' },
  
  // AI Crawlers
  { pattern: /gptbot/i, name: 'GPTBot', type: 'ai_crawler' },
  { pattern: /chatgpt/i, name: 'ChatGPT', type: 'ai_crawler' },
  { pattern: /claude/i, name: 'Claude', type: 'ai_crawler' },
  { pattern: /anthropic/i, name: 'Anthropic', type: 'ai_crawler' },
  { pattern: /perplexity/i, name: 'Perplexity', type: 'ai_crawler' },
  
  // SEO Tools
  { pattern: /semrush/i, name: 'Semrush', type: 'seo_tool' },
  { pattern: /ahrefs/i, name: 'Ahrefs', type: 'seo_tool' },
  
  // Tools
  { pattern: /curl/i, name: 'cURL', type: 'tool' },
  { pattern: /wget/i, name: 'Wget', type: 'tool' },
  { pattern: /python/i, name: 'Python', type: 'tool' },
  { pattern: /postman/i, name: 'Postman', type: 'tool' },
];

export interface BotAnalysis {
  totalRequests: number;
  botRequests: number;
  humanRequests: number;
  botPercentage: number;
  botsByType: Record<string, number>;
  knownBots: Array<{ name: string; type: string; count: number; percentage: number }>;
}

export interface TrafficData {
  userAgent: string;
  botScore?: number;
  count: number;
}

/**
 * Analyze traffic data to detect bots
 */
export function analyzeBots(data: TrafficData[]): BotAnalysis {
  const totalRequests = data.reduce((sum, d) => sum + d.count, 0);
  let botRequests = 0;
  const botsByType: Record<string, number> = {};
  const knownBotsMap: Map<string, { name: string; type: string; count: number }> = new Map();
  
  for (const item of data) {
    let isBot = false;
    let botName = '';
    let botType = '';
    
    for (const bot of KNOWN_BOTS) {
      if (bot.pattern.test(item.userAgent)) {
        isBot = true;
        botName = bot.name;
        botType = bot.type;
        break;
      }
    }
    
    if (!isBot && item.botScore !== undefined && item.botScore < 30) {
      isBot = true;
      botType = 'suspicious';
      botName = 'Suspicious';
    }
    
    if (isBot) {
      botRequests += item.count;
      botsByType[botType] = (botsByType[botType] || 0) + item.count;
      
      if (botName) {
        const existing = knownBotsMap.get(botName) || { name: botName, type: botType, count: 0 };
        existing.count += item.count;
        knownBotsMap.set(botName, existing);
      }
    }
  }
  
  const knownBots = Array.from(knownBotsMap.values())
    .map(bot => ({
      ...bot,
      percentage: totalRequests > 0 ? (bot.count / totalRequests) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    totalRequests,
    botRequests,
    humanRequests: totalRequests - botRequests,
    botPercentage: totalRequests > 0 ? (botRequests / totalRequests) * 100 : 0,
    botsByType,
    knownBots
  };
}
