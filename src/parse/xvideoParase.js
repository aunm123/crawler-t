const dbUtil = require('../db/dbUtil');

function urlPar(url, res) {
	
	let video_patt = /\/video\d+/g;
	
	if (video_patt.test(url)) {
		VideoPlayFunction(url,res);
	}
}

// 不爬取无关的页面
function fitUrl(url) {
	// let video_patt = /\/video\d+/g;
	//
	// if (video_patt.test(url)) {
	// 	return true;
	// }
	// return false;
	
	return true;
}


function VideoPlayFunction(url,res) {
	console.log("正在爬取",url);
	
	try {
		let $ = res.$;
		// console.log(res.body);
		// language=JQuery-CSS
		
		let videojs = $('#video-player-bg > script:nth-child(6)').html();
		// console.log(videojs);
		
		let videourl = videojs.match(/html5player.setVideoUrlHigh\('(.*)'\);/)[1];  //截取url
		
		let videoTitle = $('meta[property="og:title"]').attr('content');    //截取名称
		
		let videoimage = videojs.match(/html5player.setThumbUrl\('(.*)'\);/)[1];  //图片
		
		let videoid = videojs.match(/HTML5Player\('html5video', '(\d*)'\);/)[1];  //ID
		
		let video = {
			id: parseInt(videoid),
			url: videourl,
			category_id : 1,
			icon : videoimage,
			name : videoTitle,
		};
		
		// console.log(video);
		dbUtil.insertVideo(video, (finish)=>{
			if (finish) console.log("插入成功")
		})
	}catch (e) {
		console.log("爬取了错误页面",url);
	}
}

function XiaosuoFunction(url,res) {

}

function PictureFunction(url,res) {

}

module.exports ={
	urlPar,
	fitUrl,
};
