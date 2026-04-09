import React from 'react';
import ArticleCard from './ArticleCard';
import { useTranslation } from 'react-i18next';

function DashboardGrid({ articles }) {
  const { t } = useTranslation();
  
  if (!articles || articles.length === 0) {
    return <p>{t('no_articles')}</p>;
  }

  return (
    <div className="grid">
      {articles.map((item) => (
        <ArticleCard key={item.id} entry={item} />
      ))}
    </div>
  );
}

export default DashboardGrid;
