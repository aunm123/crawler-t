
const {urlPar,fitUrl} = require('./parsePage');

var Crawler = require("crawler");

var host = "http://avldz.com";

var hasReadSet = new Set();
var ResultUrl = new Object();

var c = new Crawler({
    skipDuplicates: true,
    maxConnections: 1,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            if (hasReadSet.has(this.uri)) {
            } else {
                console.log("获得返回",this.uri);

                hasReadSet.add(this.uri);

                let parentParam = res.options.parent;

                let urlSet = new Set();
                let $ = res.$;

                urlPar(this.uri, res);

                // $ 默认为 Cheerio 解析器
                $("a").each((index, item) => {
                    let tempurl = item.attribs['href'];
                    if (tempurl !== null && tempurl !== undefined && tempurl.indexOf('/') === 0) {
                        let tUrl = host + tempurl;

                        if (tUrl !== this.uri) {
                            urlSet.add(tUrl);

                            let newp = [...parentParam, host + tempurl];

                            //深度为4
                            if (newp.length < 5) {
                                c.queue({
                                    uri: host + tempurl,
                                    parent: newp,
                                });
                            }
                        }

                    }
                });

                let re = ResultUrl;
                for (let i = 0; i < parentParam.length; i++) {
                    let par = parentParam[i];
                    if (re[par] === undefined) {
                        re[par] = new Object();
                    }
                    re = re[par];
                }

                let tempArr = Array.from(urlSet);
                tempArr.forEach(function (item) {
                    re[item] = new Object();
                })

            }
            done();
        }
    }
});

c.rotateUA = true;
c.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36";


c.queue({
    headers: {},
    uri: 'http://avldz.com/vod-play-id-95765-src-1-num-1.html',
    parent: ['http://avldz.com/vod-play-id-95765-src-1-num-1.html'],
});
