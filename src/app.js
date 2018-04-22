var Crawler = require("crawler");

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
				hasReadSet.add(this.uri);
				
				let parentParam = res.options.parent;
				
				let urlSet = new Set();
				let $ = res.$;
				// $ 默认为 Cheerio 解析器
				$("a").each((index, item) => {
					let tempurl = item.attribs['href'];
					if (tempurl.indexOf('/html') === 0) {
						let tUrl = "http://www.173qr.com" + tempurl;
						
						if (tUrl !== this.uri) {
							urlSet.add(tUrl);
							
							let newp = [...parentParam, "http://www.173qr.com" + tempurl];
							
							//深度为4
							if (newp.length < 3) {
								c.queue({
									uri: "http://www.173qr.com" + tempurl,
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


c.queue({
	uri: 'http://www.173qr.com/html/novel/1/1.html',
	parent: ['http://www.173qr.com/html/novel/1/1.html'],
});

setTimeout(function () {
	console.log(JSON.stringify(ResultUrl));
	console.log(hasReadSet);
}, 5000);
