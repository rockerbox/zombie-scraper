# zombie-scraper
Crawls an array of urls to scrape the title and description of a page.

1. Install dependencies
```
npm install
```

2. Change your database configuration in parse.js on line 11-17
```
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'crawler_test',
  port: 8889
});
```

3. Run crawler
```
node run.js
```
