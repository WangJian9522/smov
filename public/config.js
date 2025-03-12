window.__CONFIG__ = {
  // The URL for the CORS proxy, the URL must NOT end with a slash!
  // If not specified, the onboarding will not allow a "default setup". The user will have to use the extension or set up a proxy themselves
  VITE_CORS_PROXY_URL: "https://tangerine-bubblegum-a7047b.netlify.app",

  // The backend URL to communicate with
  // VITE_BACKEND_URL: "https://server.vidbinge.com",
  VITE_BACKEND_URL: "https://server.fifthwit.net",

  // The READ API key to access TMDB
  VITE_TMDB_READ_API_KEY: "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NzlkZWYyZDY5ZWFlNDk4ZjJiOTI4MTgyNDdjM2ViMCIsInN1YiI6IjY2MjdmMGJlNjJmMzM1MDE0YmQ4NTFmMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.h3KpPvkiaz8uNz1bntAKqsPrxG_4UUWaY3kYME6N6m8",

  // 这是 DMCA 页面上的 DMCA 电子邮件。如果存在此配置值，则会创建一个新页面并链接到页脚中，其中会提到如何处理 DMCA 删除请求。如果配置值为空，则页面将不存在。
  VITE_DMCA_EMAIL: "ss@qq.com",

  // 该应用程序有两种路由模式：哈希路由器和历史路由器。
  // 哈希路由器意味着每个页面都与哈希链接在一起，如下所示：https://example.com/#/browse。
  // 历史路由器无需哈希即可进行路由，如下所示：https://example.com/browse，这看起来好多了，
  // 但它要求您的托管环境支持单页应用程序 (SPA) 重定向（Vercel 支持此功能）。
  // 如果您不知道这意味着什么，请不要启用此功能。
  // 将此配置值设置为true将启用历史路由器。
  VITE_NORMAL_ROUTER: true,

  // 如果您不幸收到了 DMCA 删除通知，则需要禁用某些页面。此配置键将允许您禁用特定 ID。
  // 对于节目，需要采用以下格式：series-<TMDB_ID>。对于电影，格式如下：movie-<TMDB_ID>。
  // 该列表以逗号分隔，您可以根据需要添加任意数量。
  VITE_DISALLOWED_IDS: "",

  // 用于跟踪用户行为的 Google Analytics ID。如果省略，则不会进行跟踪。
  VITE_GA_ID: "",

  // 是否启用OpenSearch，这允许用户将搜索引擎添加到浏览器中。启用时还必须设置VITE_APP_DOMAIN。
  VITE_OPENSEARCH_ENABLED: false,

  // 应用所在的域。仅当VITE_OPENSEARCH_ENABLED启用该选项时才需要。
  // 该值必须包含协议（HTTP/HTTPS），但不能以斜杠结尾。
  VITE_APP_DOMAIN: "",

  // chrome extension
  VITE_ONBOARDING_CHROME_EXTENSION_INSTALL_LINK: "https://docs.undi.rest/chrome-extension",

  // firefox extension
  VITE_ONBOARDING_FIREFOX_EXTENSION_INSTALL_LINK: "https://docs.undi.rest/firefox-extension",

  // true如果要输出 PWA 应用程序，请设置为。设置为false或省略以获取普通的 Web 应用程序。
  // PWA Web 应用程序可以作为应用程序安装到您的手机或台式电脑上，但管理起来可能比较棘手，并且会有一些麻烦。
  VITE_PWA_ENABLED: true,

  // Cloudflare 验证码的Turnstile 密钥。它用于验证对代理工作者（或提供商 API）的请求。
  // 代理服务器需要进行配置以接受这些验证码令牌，否则对安全性没有影响。
  VITE_TURNSTILE_KEY: "",

  // 如果您希望用户在开始观看之前收到入门屏幕提示，请启用此功能。
  VITE_HAS_ONBOARDING: false,

  // 是否允许使用主机提供的代理的用户自动播放。
  VITE_ALLOW_AUTOPLAY: true
};
