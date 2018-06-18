var Crawler = require("crawler");
const dbUtil = require('../db/dbUtil');

dbUtil.init();

// 16
// 11
// 13
// 12
// 10
// 9

let typeid = 9;   //网页分类id
let maxpage = 98;  //最大页数
let currentCategoryid = 14;

let startUrl = 'http://97avt.com/?m=art-type-id-' + typeid + '.html';
let host = startUrl.match(/(https?:\/\/\S[^/]*)/)[1];


function startFF() {

	// for (let i = 16; i<=17; i++){
	// 	let temp = startUrl.replace(/-id-(\d*)/,"-id-"+i);
	// 	// console.log(temp);2
	// 	cFirst.queue({
	// 		uri: temp,
	// 		timeout: 150000,
	// 	})
	// }

	cFirst.queue({
		uri: startUrl,
		timeout: 150000,
	})

}

// 入口
// 获得最大页数
// 获得分类
var cFirst = new Crawler({
	skipDuplicates: true,
	maxConnections: 1,
	rateLimit: 2000,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			try {
				let $ = res.$;


				for (let i = maxpage; i > 0; i--) {
					let temp = 'http://97avt.com/?m=art-type-id-' + typeid + '-pg-' + i + '.html';
					cList.queue({
						uri: temp,
						timeout: 150000,
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
	maxConnections: 1,
	rateLimit: 5000,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			let $ = res.$;
			let targetUl = $('.list ul li a');
			targetUl.each(function (index, item) {
				let url = host + item.attribs.href;

				let id = url.match(/-id-(\d*)/)[1];
				let tag = '97v' + id;

				dbUtil.findArticleByTag(tag,(finish)=>{
					if (finish === false){
						cDetail.queue({
							uri: url,
							timeout: 150000,
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
	maxConnections: 1,
	rateLimit: 1000,
	callback: function (error, res, done) {
		if (error) {
			dbUtil.insertCache(res.options.uri);
			console.log(error);
		} else {
			try {
				let $ = res.$;
				let detail_content = $('.content').html();
				detail_content = unescape(detail_content.replace(/&#x/g,'%u').replace(/;/g,''));

				let name = $('.page_title').text();
				let icon = $('.content img:nth-child(2)').attr('src');
				let id = res.options.uri.match(/-id-(\d*)/)[1];

				if (detail_content === null || detail_content === undefined) {

				} else {
					let article = {
						content: detail_content,
						category_id: currentCategoryid,
						name: name,
						des: name,
						create_time: new Date(),
						icon: icon,
						tag: '97v' + id
					};

					dbUtil.insertArticle(article, (finish) => {
						if (finish !== false) console.log(new Date(),"文章插入成功")
					})
				}
			}catch (e){}
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