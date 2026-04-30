const Parser = require('rss-parser');
const cheerio = require('cheerio');

const parser = new Parser();

async function fetchRSS(url, db) {
  try {
    const feed = await parser.parseURL(url);
    const insert = db.prepare('INSERT OR IGNORE INTO articles (title, url, date, source) VALUES (?, ?, ?, ?)');
    
    // Wrap in a transaction
    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(item.title, item.link, item.pubDate || new Date().toISOString(), feed.title || 'RSS');
      }
    });
    
    transaction(feed.items);
    return feed.items.length;
  } catch (err) {
    console.error('Error fetching RSS:', err);
    throw err;
  }
}

async function fetchUniversityWeb(url, db) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const articles = [];
    $('a').each((i, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr('href');
      // Very naive filtering to find article links
      if (title && title.length > 20 && href && href.startsWith('http')) {
        articles.push({ title, link: href });
      }
    });

    const insert = db.prepare('INSERT OR IGNORE INTO articles (title, url, date, source, university) VALUES (?, ?, ?, ?, ?)');
    const transaction = db.transaction((items) => {
       for(const a of items) {
         insert.run(a.title, a.link, new Date().toISOString(), url, 'University Generic');
       }
    });

    transaction(articles.slice(0, 10)); // Take top 10
    return articles.length;
  } catch(err) {
    console.error('Error in Cheerio scraper:', err);
    throw err;
  }
}

module.exports = { fetchRSS, fetchUniversityWeb };
