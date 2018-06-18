var Crawler = require("crawler");
const dbUtil = require('../db/dbUtil');
const ImgDoenload = require('../util/ImgDoenload');
var http = require("https");
var qs = require("querystring");
var zlib = require('zlib');
var request = require("request");

dbUtil.init();

let mat = 67;

function start(page) {


	var options = { method: 'POST',
		encoding : null,
		url: 'https://pigav.com/wp-admin/admin-ajax.php',
		qs: { td_theme_name: 'Newsmag', v: '4.4' },
		headers:
			{ 'postman-token': 'c2b85b03-4d77-b81b-56f1-957851b274a8',
				'cache-control': 'no-cache',
				'x-requested-with': 'XMLHttpRequest',
				'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36',
				referer: 'https://pigav.com/%e7%b2%be%e9%81%b8av%e7%b7%9a%e4%b8%8a%e7%9c%8b',
				origin: 'https://pigav.com',
				cookie: '__cfduid=df3e83722072b1f105443fbb1b665f57f1527508731; PHPSESSID=t4d4a6ba6uhkrgnbccfrkjuh21; _ga=GA1.2.1181583890.1527508734; _gid=GA1.2.747285000.1527508734; _gat_gtag_UA_43568905_20=1',
				'content-type': 'application/x-www-form-urlencoded',
				'content-length': '3187',
				'accept-language': 'zh-CN,zh;q=0.9',
				'accept-encoding': 'gzip, deflate, br',
				accept: '*/*' },
		form:
			{ action: 'td_ajax_block',
				td_atts: '{"custom_title":"","category_id":"","sort":"random_posts","limit":"1000","ajax_pagination":"load_more","separator":"","custom_url":"","block_template_id":"","border_top":"","color_preset":"","mx4_tl":"","post_ids":"","category_ids":"","tag_slug":"","autors_id":"","installed_post_types":"","offset":"","el_class":"","td_ajax_filter_type":"","td_ajax_filter_ids":"","td_filter_default_txt":"All","td_ajax_preloading":"","f_header_font_header":"","f_header_font_title":"Block header","f_header_font_settings":"","f_header_font_family":"","f_header_font_size":"","f_header_font_line_height":"","f_header_font_style":"","f_header_font_weight":"","f_header_font_transform":"","f_header_font_spacing":"","f_header_":"","f_ajax_font_title":"Ajax categories","f_ajax_font_settings":"","f_ajax_font_family":"","f_ajax_font_size":"","f_ajax_font_line_height":"","f_ajax_font_style":"","f_ajax_font_weight":"","f_ajax_font_transform":"","f_ajax_font_spacing":"","f_ajax_":"","f_more_font_title":"Load more button","f_more_font_settings":"","f_more_font_family":"","f_more_font_size":"","f_more_font_line_height":"","f_more_font_style":"","f_more_font_weight":"","f_more_font_transform":"","f_more_font_spacing":"","f_more_":"","mx4f_title_font_header":"","mx4f_title_font_title":"Article title","mx4f_title_font_settings":"","mx4f_title_font_family":"","mx4f_title_font_size":"","mx4f_title_font_line_height":"","mx4f_title_font_style":"","mx4f_title_font_weight":"","mx4f_title_font_transform":"","mx4f_title_font_spacing":"","mx4f_title_":"","mx4f_cat_font_title":"Article category tag","mx4f_cat_font_settings":"","mx4f_cat_font_family":"","mx4f_cat_font_size":"","mx4f_cat_font_line_height":"","mx4f_cat_font_style":"","mx4f_cat_font_weight":"","mx4f_cat_font_transform":"","mx4f_cat_font_spacing":"","mx4f_cat_":"","ajax_pagination_infinite_stop":"","css":"","tdc_css":"","td_column_number":3,"header_color":"","class":"td_uid_10_5b0d4c7e72c88_rand","tdc_css_class":"td_uid_10_5b0d4c7e72c88_rand","tdc_css_class_style":"td_uid_10_5b0d4c7e72c88_rand_style"}',
				td_block_id: 'td_uid_10_5b0d4c7e72c88',
				td_column_number: '3',
				td_current_page: page.toString(),
				block_type: 'td_block_16',
				td_filter_value: '',
				td_user_action: '' } };

	request(options, function (error, response, body) {
		if (error) throw new Error(error);

		// var responseData = new Buffer (body);

		if (response.headers['content-encoding'].indexOf('gzip') !== -1) {
			// 解压gzip
			body = zlib.gunzipSync(body)
		}
		let resultjson = JSON.parse(body.toString()).td_data;

		c.queue([{
			html: resultjson
		}]);

	});

}

Date.prototype.Format = function (fmt) { //author: meizz
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}


var c = new Crawler({
	callback: function (error, res, done) {
		if (error) {
			console.log(error);
		} else {
			let $ = res.$;
			let targetUl = $('.td-block-span4');
			targetUl.each(function (index, item) {

				let id = $(item).find('.td-image-wrap').attr('href');
				id = id.match(/com\/(\d*)\//)[1];

				let url = $(item).find('.td-image-wrap').attr('href');
				let icon = $(item).find('.td-module-thumb img').attr('src');
				let name = $(item).find('.td-module-title a').attr('title');
				let tag = "pva" + id;

				let video = {
					url: '',
					mcategory_id: mat,
					icon: icon,
					name: name,
					createtime: new Date(),
					tag: tag,
				};
				video_request(url, video)

				// dbUtil.findVideoByTag(tag,(finish)=>{
				// 	if (finish === false){
				// 		try {
				// 			video_request(url, video)
				// 		}catch (e){}
				// 	}else {
				// 		console.log(new Date().Format("yyyy-MM-dd HH:mm:ss") ," 重复")
				// 	}
				// })

			})
		}
		done();
	}
});


function video_request(url, video) {

	// https://pigav.com/215891/sperm-fill-sweet-ai-minano.html
	let path = url.replace('https://pigav.com', '');

	var options = {
		"method": "GET",
		"hostname": "pigav.com",
		"port": null,
		"path": path,
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
			"accept-encoding": "gzip, deflate, br",
			"accept-language": "zh-CN,zh;q=0.9",
			"cookie": "__cfduid=df3e83722072b1f105443fbb1b665f57f1527508731; PHPSESSID=t4d4a6ba6uhkrgnbccfrkjuh21; _ga=GA1.2.1181583890.1527508734; _gid=GA1.2.747285000.1527508734",
			"upgrade-insecure-requests": "1",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36",
			"cache-control": "no-cache",
			"postman-token": "f7050e43-7f32-ad7d-8730-82f440ba5fda"
		}
	};

	var req = http.request(options, function (res) {
		var chunks = [];
		res.on("data", function (chunk) {
			chunks.push(chunk);
		});
		res.on("end", function () {
			try {
				var body = Buffer.concat(chunks);
				if (res.headers['content-encoding'].indexOf('gzip') !== -1) {
					// 解压gzip
					body = zlib.gunzipSync(body)
				}
				let result = body.toString();
				let videourl = result.match(/"file":"(.[^"]*)"/)[1];

				video.url = videourl;

				// dbUtil.findVideoByUrl(videourl,(finish)=>{
				// 	if (finish === false){
				// 		ImgDoenload(video.icon, (filename)=>{
				// 			video.icon = filename;
				// 			dbUtil.insertVideo(video, (finish) => {
				// 				if (finish) console.log(new Date().Format("yyyy-MM-dd HH:mm:ss") ," 插入成功")
				// 			});
				//
				// 		});
				// 	}
				// })

			}catch (e){}

		});
	});

	req.end();
}

start(3);