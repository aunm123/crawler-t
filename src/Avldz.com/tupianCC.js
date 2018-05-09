var Crawler = require("crawler");
const dbUtil = require('../db/dbUtil');

dbUtil.init();

let startUrl = 'http://avldz.com/art-type-id-9-pg-1.html';
let host = startUrl.match(/(https?:\/\/\S[^/]*)/)[1];
let currentCategoryid = 0;

function startFF() {

	for (let i = 8; i<=15; i++){
		let temp = startUrl.replace(/-id-(\d*)/,"-id-"+i);
		// console.log(temp);2
		cFirst.queue({
			uri: temp,
			timeout: 150000,
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
				
				let ll = $('.pagination .pagebtn').attr('onclick').match(/,(\d*)/)[1];
				let ll2 = $('.pagination .pagelink_a').attr('href');
				
				let lastUrl = ll2.replace(/-pg-(\d*)/,"-pg-"+ll);
				let maxPage = lastUrl.match(/-pg-(\d*)/)[1];
				
				let	id = res.options.uri.match(/type-id-(\d*)-/)[1];
				let	name = $('head > meta:nth-child(3)').attr('content');
				name = name.match(/(\S*)第/)[1];
				
				currentCategoryid = id;
				
				let category = {
					id: id,
					name: name,
					des: name,
				}
				
				dbUtil.insertCategory(category);
				
				let urldemo = host + lastUrl;
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
					content: detail_content,
					category_id: currentCategoryid,
					name: name,
					des: name,
					create_time: new Date(),
					icon: icon,
					tag: 'qr'+id,
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