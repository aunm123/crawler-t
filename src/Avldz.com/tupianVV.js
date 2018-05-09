var Crawler = require("crawler");
const dbUtil = require('../db/dbUtil');
const ImgDoenload = require('../util/ImgDoenload');

dbUtil.init();

let startUrl = 'http://avldz.com/vod-type-id-56-pg-1.html';
let host = startUrl.match(/(https?:\/\/\S[^/]*)/)[1];
let currentCategoryid = 0;

function not(url) {
	if (url === "http://avldz.comundefined"){
		return false;
	}
	return true
}


function startFF() {

	for (let i = 56; i<=64; i++){
		let temp = startUrl.replace(/-id-(\d*)/,"-id-"+i);
		// console.log(temp);
		cFirst.queue({
			uri: temp,
			timeout: 1000,
			retries: 100,
		})
	}

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

				let ll = $('.pagination .pagebtn').attr('onclick').match(/,(\d*)/)[1];
				let ll2 = $('.pagination .pagelink_a').attr('href');

				let lastUrl = ll2.replace(/-pg-(\d*)/, "-pg-" + ll);
				let maxPage = lastUrl.match(/-pg-(\d*)/)[1];

				let id = res.options.uri.match(/type-id-(\d*)-/)[1];

				let href = "/vod-type-id-" + id + "-pg-1.html";


				let name = $(`a[href='${href}']`).attr('title');

				currentCategoryid = id;

				let category = {
					id: id,
					name: name,
					des: name,
				}

				dbUtil.insertCategory(category);

				let urldemo = host + lastUrl;
				for (let i = maxPage; i > 0; i--) {
					let temp = urldemo.replace(/-pg-(\d*)/, "-pg-" + i);

					if (not(temp)){
						cList.queue({
							uri: temp,
							timeout: 150000,
						});
					}

				}
			} catch (e) {
				console.log(e)
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
			let targetUl = $('.box.movie_list ul li a');

			targetUl.each(function (index, item) {
				let url = host + item.attribs.href;

				// http://avldz.com/vod-detail-id-95817.html
				let id = url.match(/-id-(\d*)./)[1];
				
				let tag = 'qavldz'+id;

				dbUtil.findVideoByTag(tag,(finish)=>{
					if (finish === false){
						if (not(url)){
							cDetail.queue({
								uri: url,
								timeout: 150000,
							});
						}
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
	rateLimit: 5000,
	callback: function (error, res, done) {
		if (error) {
			dbUtil.insertCache(res.options.uri);
			console.log(error);
		} else {
			let $ = res.$;

			let imagep = $('.movie_info dl dt img').attr('src');
			if (!(/^http/.test(imagep))){
				imagep = host + imagep;
			}

			let playDetail = host + $('.play-list a:nth-child(1)').attr('href');

			if (not(playDetail)){
				cvideo.queue({
					uri: playDetail,
					videoImageUrl: imagep,
				});
			}
		}
		done();
	}
});


var cvideo = new Crawler({
	skipDuplicates: true,
	maxConnections: 1,
	rateLimit: 1000,
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			try {
				let $ = res.$;

				let videoMessage = $('#players > script:nth-child(1)').html();

				let videoTitle = videoMessage.match(/mac_name='(\S[^']*)',/)[1];   				//截取名称

				let videourl = videoMessage.match(/mac_url=unescape\('(\S[^']*)'/)[1];    		//截取url
				videourl = unescape(videourl);
				try {
					videourl = videourl.match(/\S*\$(\S*)/)[1];
				}catch (e){}

				let videoid = videoMessage.match(/\/vod-play-id-(\d*)-/)[1];

				let video_cid = $('body > div:nth-child(9) > div:nth-child(1) > span > a:nth-child(2)').attr('href');
				video_cid = video_cid.match(/vod-type-id-(\d*)-/)[1];
				
				let tag = 'qavldz'+videoid;

				
				
				ImgDoenload(res.options.videoImageUrl, (filename)=>{
					
					let video = {
						tag: tag,
						url: videourl,
						mcategory_id: parseInt(video_cid),
						icon: filename,
						name: videoTitle,
						createtime: new Date(),
					};
					// console.log(video);
					
					dbUtil.insertVideo(video, (finish) => {
						if (finish) console.log("插入成功")
					});
					
				});
				
			}catch (e){
				dbUtil.insertCache(res.options.uri, '[]', function () {
					console.log(res.options.uri , "抓取失败");
				});
			}

		}
		done();

	}
});


startFF();

// cFirst.queue({
// 	uri: startUrl,
// 	timeout: 1000,
// 	retries: 100,
// })

// 每秒检测一次，队列是否为空
setInterval(function () {
	if (cFirst.queueSize === 0 && cList.queueSize === 0 && cDetail.queueSize === 0 && cvideo.queueSize === 0) {
		console.log('爬取已结束');
		// console.log(hasReadSet);
		process.exit();
	}
}, 1000);