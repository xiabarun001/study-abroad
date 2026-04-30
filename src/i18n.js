import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      "app_title": "Study-abroad Assistant",
      "force_refresh": "Refresh Data",
      "loading": "Loading articles...",
      "no_articles": "No articles found. Try refreshing data."
    }
  },
  zh: {
    translation: {
      "app_title": "留学小助手",
      "force_refresh": "立即刷新获取新数据",
      "loading": "正在加载新闻...",
      "no_articles": "暂无数据，请尝试刷新。"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
