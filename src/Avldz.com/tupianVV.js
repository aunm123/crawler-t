var Crawler = require("crawler");
const dbUtil = require('../db/dbUtil');

dbUtil.init();

let startUrl = 'http://avldz.com/art-type-id-9-pg-1.html';
let host = startUrl.match(/(https?:\/\/\S[^/]*)/)[1];
let currentCategoryid = 0;


function startFF() {

	for (let i = 19; i<=24; i++){
		let temp = startUrl.replace(/-id-(\d*)/,"-id-"+i);
		// console.log(temp);
		cFirst.queue({
			uri: temp,
			timeout: 150000,
		})
	}

}


startFF();

//每秒检测一次，队列是否为空
setInterval(function () {
	if (cFirst.queueSize === 0 && cList.queueSize === 0 && cDetail.queueSize === 0) {
		console.log('爬取已结束');
		// console.log(hasReadSet);
		process.exit();
	}
}, 1000);