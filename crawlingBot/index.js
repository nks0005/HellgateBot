const Crawl = require('./modules/crawl.js');
const Stat = require('./modules/statistics.js');

let crawl = new Crawl();
let stat = new Stat();



const start = async() => {
    const sleep = () => new Promise(resolve => {
        setTimeout(() => {
            resolve('done')
        }, 30000);
    })

    await crawl.start(0, 200);

    while (true) {
        console.log('start');
        await crawl.start(0, 50);
        console.log('end');
        await sleep();
        stat.start();
        await sleep();
    }
}

start();