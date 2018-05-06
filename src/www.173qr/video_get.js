var Crawler = require("crawler");
const dbUtil = require('../db/dbUtil');
const ImgDoenload = require('../util/ImgDoenload');

dbUtil.init();

let startUrl = 'http://www.173qr.com/html/video/1/1.html';
let host = startUrl.match(/(https?:\/\/\S[^/]*)/)[1];

function startFF() {

	for (let i = 1; i <= 8; i++) {
		let temp = startUrl.replace(/video\/(\d*)/, "video/" + i);
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
	maxConnections: 5,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			try {
				let $ = res.$;


				let id = res.options.catid;
				let name = $('.nle h3').text();

				let category = {
					id: id,
					name: name,
					des: name,
				}
				// console.log(category);

				dbUtil.insertCategory(category);

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
			let targetUl = $('.nbox ul li a');
			targetUl.each(function (index, item) {
				let url = host + item.attribs.href;

				let tag = 'qrv' + url.match(/\/(\d*).html/)[1];

				dbUtil.findVideoByTag(tag,(finish)=>{
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
			let imagep = $('dl dt img').attr('src');
			imagep = host+imagep;
			
			let playDetail = host + $('.film_bar a').attr('href');
			let playtitle = $('.film_title').text();
			
			cvideo.queue({
				uri: playDetail,
				videoImageUrl: imagep,
				videoTitle: playtitle,
				catid: res.options.catid,
			});
		}
		done();
	}
});

var cvideo = new Crawler({
	skipDuplicates: true,
	maxConnections: 5,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			try {
				let $ = res.$;
				
				ImgDoenload(res.options.videoImageUrl, (filename)=>{
					let html = $.html();
					let videourl = html.match(/video:'(\S[^']*)'/)[1];
					let tag = 'qrv' + res.options.uri.match(/\/(\d*).html/)[1];

					let video = {
						url: videourl,
						mcategory_id: res.options.catid,
						icon: filename,
						name: res.options.videoTitle,
						createtime: new Date(),
						tag: tag,
					};
					// console.log(video);

					dbUtil.insertVideo(video, (finish) => {
						if (finish) console.log("插入成功")
					});

				});
				
				
				
			}catch (e){
			}
			
		}
		done();
		
	}
});


startFF();

//每秒检测一次，队列是否为空
setInterval(function () {
	if (cFirst.queueSize === 0 && cList.queueSize === 0 && cDetail.queueSize === 0 && cvideo.queueSize === 0) {
		console.log('爬取已结束');
		// console.log(hasReadSet);
		process.exit();
	}
}, 1000);