var Crawler = require("crawler");
const dbUtil = require('../db/dbUtil');

dbUtil.init();

let startUrl = 'http://173qr.com/html/novel/1/1.html';
let host = startUrl.match(/(https?:\/\/\S[^/]*)/)[1];

let nocate={
	1:19,
	2:23,
	3:25,
	4:20,
	5:22,
	6:21,
	7:26,
	8:24,
};

function startFF() {

	for (let i = 1; i <= 8; i++) {
		let temp = startUrl.replace(/novel\/(\d*)/, "novel/" + i);
		// console.log(temp);

		cFirst.queue({
			uri: temp,
			timeout: 150000,
			catid: nocate[i],
		})
	}

}

// 入口
// 获得最大页数
// 获得分类
var cFirst = new Crawler({
	skipDuplicates: true,
	maxConnections: 5,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			try {
				let $ = res.$;


				let id = res.options.catid;
				// let name = $('.nle h3').text();
				//
				// let category = {
				// 	id: id,
				// 	name: name,
				// 	des: name,
				// }
				// console.log(category);

				// dbUtil.insertCategory(category);

				let maxPage = $('.pagination a');
				maxPage = maxPage[maxPage.length - 1].attribs.href;
				maxPage = maxPage.match(/\/(\d*).html/)[1];
				let urldemo = res.options.uri;
				for (let i = maxPage; i > 0; i--) {
					let temp = urldemo.replace(/\/(\d*).html/, "\/" + i + ".html");

					// console.log(temp);

					cList.queue({
						uri: temp,
						timeout: 150000,
						catid: id,
					});
				}

			} catch (e) {
				// console.log(e)
			}

		}
		done();
	}
});


var cList = new Crawler({
	skipDuplicates: true,
	maxConnections: 5,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			let $ = res.$;
			let targetUl = $('.plist ul li a');
			targetUl.each(function (index, item) {
				let url = host + item.attribs.href;

				let tag = 'qr' + url.match(/\/(\d*).html/)[1];
				// console.log(url);


				dbUtil.findArticleByTag(tag,(finish)=>{
					if (finish === false){
						cDetail.queue({
							uri: url,
							timeout: 150000,
							catid: res.options.catid,
						});
					}
				})

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
			let detail_content = $('.txt .tcont').html();
			let name = $('.txt .thead').text();
			let icon = $('.txt .tcont img:nth-child(2)').attr('src');
			let id = res.options.uri.match(/\/(\d*).html/)[1];

			let pn = $('.txt .tcont .pn').html();
			detail_content = detail_content.replace(pn,'');
			detail_content = detail_content.replace('<div class="pn"></div>','');

			if (detail_content === null || detail_content === undefined) {

			} else {
				let article = {
					content: detail_content,
					category_id: res.options.catid,
					name: name,
					des: name,
					create_time: new Date(),
					icon: icon,
					tag: 'qr'+id,
				};
				// console.log(article);

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