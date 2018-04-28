var Crawler = require("crawler");
const dbUtil = require('../db/dbUtil');

dbUtil.init();

let startUrl = 'http://www.173qr.com/html/photo/1/1.html';
let host = startUrl.match(/(https?:\/\/\S[^/]*)/)[1];
let currentCategoryid = 0;

function startFF() {
	
	for (let i = 1; i<=8; i++){
		let temp = startUrl.replace(/photo\/(\d*)/,"photo/"+i);
		// console.log(temp);
		cFirst.queue({
			uri: temp,
			timeout: 150000,
			catid: i,
		})
	}
	
}

// 入口
// 获得最大页数
// 获得分类
var cFirst = new Crawler({
	skipDuplicates: true,
	maxConnections: 1,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			try {
				let $ = res.$;
				
				
				let	id = res.options.catid;
				let	name = $('.nle h3').text();
				
				currentCategoryid = id;
				
				let category = {
					id: id,
					name: name,
					des: name,
				}
				// console.log(category);
				
				dbUtil.insertCategory(category);

				let urldemo = res.options.uri;
				for(let i = maxPage ; i>0 ; i--){
					let temp = urldemo.replace(/-pg-(\d*)/,"-pg-"+i);
					cList.queue({
						uri: temp,
						timeout: 150000,
					});
				}
				
			}catch (e){
				// console.log(e)
			}
			
		}
		done();
	}
});


var cList = new Crawler({
	skipDuplicates: true,
	maxConnections: 1,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			let $ = res.$;
			let targetUl = $('body > div:nth-child(9) > div.wrap.mt10 > div.box.list.channel > ul > li a');
			targetUl.each(function (index, item) {
				let url = host + item.attribs.href;
				
				cDetail.queue({
					uri: url,
					timeout: 150000,
				});
			})
		}
		done();
	}
});


var cDetail = new Crawler({
	skipDuplicates: true,
	maxConnections: 5,
	callback: function (error, res, done) {
		if (error) {
			dbUtil.insertCache(res.options.uri);
			console.log(error);
		} else {
			let $ = res.$;
			let detail_content = $('.content .movievod').html();
			let name = $('.page_title h3').text();
			let icon = $('.content .movievod img:nth-child(2)').attr('src');
			let id = res.options.uri.match(/-id-(\d*)-/)[1];
			
			if (detail_content === null || detail_content === undefined){
			
			}else {
				let article = {
					id: id,
					content: detail_content,
					category_id: currentCategoryid,
					name: name,
					des: name,
					create_time: new Date(),
					icon: icon,
				};
				
				dbUtil.insertArticle(article, (finish) => {
					if (finish !== false) console.log("文章插入成功")
				})
			}
		}
		done();
	}
});


startFF();

//每秒检测一次，队列是否为空
setInterval(function () {
	if (cFirst.queueSize === 0 && cList.queueSize === 0 && cDetail.queueSize === 0) {
		console.log('爬取已结束');
		// console.log(hasReadSet);
		process.exit();
	}
}, 1000);