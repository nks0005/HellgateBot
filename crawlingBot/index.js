const Crawl = require('./modules/crawl.js');
const Stat = require('./modules/statistics.js');

let crawl = new Crawl();
let stat = new Stat();

crawl.start(0, 200);
//stat.start();