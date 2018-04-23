const dbUtil = require('./db/dbUtil');
const {urlPar, fitUrl} = require('./parse/xvideoParase');

dbUtil.init();

var Crawler = require("crawler");

var host = "https://www.xvideos.com";

var hasReadSet = new Set();
var ResultUrl = new Object();

dbUtil.findAllCache(1, (result)=>{
	if (result!==false) {
		result.forEach((item)=>{
			hasReadSet.add(item.url);
		});
		
		startCrawler();
	}
});

var c = new Crawler({
	skipDuplicates: true,
	maxConnections: 1,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			
			// 还没爬取过
			// 本次爬取去重
			if (hasReadSet.has(this.uri)) {
			} else {
				// 还没爬取过
				dbUtil.setUrlCacheHasRead(this.uri);
				console.log("获得返回", this.uri);
				hasReadSet.add(this.uri);
				
				try {
					urlPar(this.uri, res);
				} catch (e){
					console.log('分析失败')
				}
				
				//深度爬取得
				deepCrawler(5, res , this.uri);
				
			}
			done();
			
			
		}
	}
});


function deepCrawler(deep, res ,uri) {
	
	let parentParam = res.options.parent;
	
	let urlSet = new Set();
	let $ = res.$;
	
	// $ 默认为 Cheerio 解析器
	$("a").each((index, item) => {
		let tempurl = item.attribs['href'];
		if (tempurl !== null && tempurl !== undefined && tempurl.indexOf('/') === 0) {
			let tUrl = host + tempurl;
			
			if (tUrl !== uri) {
				urlSet.add(tUrl);
				
				let parrUrl = host + tempurl;
				if (passUrl(parrUrl) && fitUrl(parrUrl)) {
					let newp = [...parentParam, parrUrl];
					//深度为
					if (newp.length < deep) {
						dbUtil.insertCache(parrUrl, JSON.stringify(newp));
						c.queue({
							uri: parrUrl,
							parent: newp,
						});
						
					}
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

function passUrl(url) {
	let video_patt = /\.xml|\.js|\.css|\.mp4/
	
	if (video_patt.test(url)) {
		return false;
	}
	return true;
}


c.rotateUA = true;
c.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36";


function startCrawler() {
	
	// 找出之前已经爬取但还没读取的Html
	// 他们的父级变成2级别
	dbUtil.findAllCache(0, (result)=>{
		if (result!==false) {
			result.forEach((item)=>{
				c.queue({
					uri: item.url,
					parent: JSON.parse(item.level),
				});
			});
		}
	});
	
	
	c.queue({
		headers: {
			// Content-Type:text/html;;charset=UTF-8
		},
		uri: 'https://www.xvideos.com/',
		parent: ['https://www.xvideos.com/'],
	});

//每秒检测一次，队列是否为空
	setInterval(function () {
		if (c.queueSize === 0) {
			console.log('爬取已结束');
			// console.log(hasReadSet);
			process.exit();
		}
	}, 1000);
}
