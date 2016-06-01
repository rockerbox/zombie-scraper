var Browser = require('zombie'),
  cheerio = require('cheerio'),
  mysql = require('mysql');

var start_ts = new Date().getTime();

/*
  Open connection to the database
*/

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'crawler_test',
  port: 8889
});

connection.connect();

var Parser = function() {
  this.batch = [];
  this.current_i = 0;
  this.browser;

  this.getTitle = function(html) {
    var title = html('meta[property="og:title"]').attr('content');
    if (title == '' || typeof title === typeof undefined) {
      var title = html('title').text();
    }

    return title;
  }

  this.getDescription = function(html) {
    var description = html('meta[property="og:description"]').attr('content');
    if (description == '' || typeof description === typeof undefined) {
      var description = html('meta[name="description"]').attr('content');
    }

    if (description == '' || typeof description === typeof undefined) {
      var description = html('meta[name="Description"]').attr('content');
    }

    return description;
  }
}

Parser.prototype.set_batch = function(x) {
  this.batch = x;

  return this;
}

Parser.prototype.parseNext = function() {
  var _this = this;
  var start_ts = new Date().getTime();

  var current_url = this.batch[this.current_i];

  // Make sure given URL has valid http prefix
  if (current_url.slice(0, 4) != 'http') {
    current_url = 'http://' + current_url;
  }

  _this.browser.visit(current_url, function(e) {
    var html = cheerio.load(_this.browser.html());

    var result = {
      url: current_url,
      title: _this.getTitle(html),
      description: _this.getDescription(html),
      duration: (new Date().getTime() - start_ts)
    };

    // saveResult(result);

    _this.save(result);

    if(_this.current_i < _this.batch.length) {
      _this.current_i++;
      _this.parseNext();
    } else {
      _this.browser.window.close();
    }

    console.log(result);
  });
}

Parser.prototype.save = function(result) {
  var query = connection.query('INSERT INTO zombie_urls SET ?', result, function(err, result) {
   console.log('Added to database');
 });
}

Parser.prototype.run = function() {
  this.browser = new Browser({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',
    debug: false,
    waitFor: 10000,
    runScripts: true,
    loadCSS: false,
    silent: true
  });

  this.parseNext();
}

var parser = new Parser;

var batch = process.argv.slice(2) + ''
var batch = batch.split(',');
console.log('!!!!!!!BATCH', batch);
// .slice(1,-1).split(' ');

parser
  .set_batch(batch)
  .run();
