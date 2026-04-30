const cheerio = require('cheerio');

function extractProgramData(htmlString) {
  const $ = cheerio.load(htmlString);
  
  // Generic extraction strategy
  const title = $('h1').first().text().trim();
  
  // Gather all paragraph texts as a combined description
  const paragraphs = [];
  $('p').each((i, el) => {
    paragraphs.push($(el).text().trim());
  });
  
  const description = paragraphs.join('\n');
  
  return {
    title,
    description
  };
}

module.exports = { extractProgramData };
