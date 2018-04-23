const Crawler = require("crawler");
const config = require('../global');
const dbUtil = require('../db/dbUtil');

function urlPar(url, res) {

	let video_patt = /\/vod-detail-id-\d+/;

	if (video_patt.test(url)) {
		VideoPlayFunction(url, res);
	}
}

function fitUrl(url, length) {
	if (length >= 3) {
		let video_patt = /\/vod-detail-id-\d+/;

		if (video_patt.test(url)) {
			return true;
		}


		return false;
	}
	return true;
}

// 视频爬取
function VideoPlayFunction(url, res) {
	console.log("正在爬取", url);

	let $ = res.$;
	let imagep = $('#main > div > div.film_info.clearfix > div > dl > dt > img').attr('src');

	let playDetail = config.host + $('#mp4play > div.play-list > a:nth-child(1)').attr('href');

	config.chirldLoading += 1;
	cvideo.queue({
		uri: playDetail,
		videoImageUrl: imagep,
	});
}
var cvideo = new Crawler({
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			let $ = res.$;

			let videoMessage = $('#players > script:nth-child(1)').html();

			let videoTitle = videoMessage.match(/mac_name='(\S[^']*)',/)[1];   				//截取名称

			let videourl = videoMessage.match(/mac_url=unescape\('(\S[^']*)'/)[1];    		//截取url
			videourl = unescape(videourl);
			videourl = videourl.match(/在线播放\$(\S*)/)[1];

			let videoid = videoMessage.match(/\/vod-play-id-(\d*)-/)[1];

			let video_cid = $('body > div:nth-child(9) > div:nth-child(1) > span > a:nth-child(2)').attr('href');
			video_cid = video_cid.match(/vod-type-id-(\d*)-/)[1];

			let video = {
				id: parseInt(videoid),
				url: videourl,
				category_id: parseInt(video_cid),
				icon: res.options.videoImageUrl,
				name: videoTitle,
				createtime: new Date(),
			};

			dbUtil.insertVideo(video, (finish) => {
				config.chirldLoading = config.chirldLoading - 1;
				if (finish) console.log("插入成功")
			});

		}
		done();

	}
});

// 图片区爬取
function XiaosuoFunction(url, res) {

}

function PictureFunction(url, res) {

}

module.exports = {
	urlPar,
	fitUrl,
};


