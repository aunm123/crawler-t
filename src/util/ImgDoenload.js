const {randName32} = require("./Rand");
const path = require('path');
var md5 = require('md5');
const fs = require('fs'),
	request = require('request');

Date.prototype.format = function (fmt) {
	var o = {
		"M+": this.getMonth() + 1,                 //月份
		"d+": this.getDate(),                    //日
		"h+": this.getHours(),                   //小时
		"m+": this.getMinutes(),                 //分
		"s+": this.getSeconds(),                 //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds()             //毫秒
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for (var k in o) {
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

var download = function (uri, callback) {
	try{
		request.head(uri, function (err, res, body) {
			// console.log('content-type:', res.headers['content-type']);
			// console.log('content-length:', res.headers['content-length']);

			let curTime = new Date().format("yyyy_MM_dd");
			let index1=uri.lastIndexOf(".");
			let index2=uri.length;
			let suffix=uri.substring(index1+1,index2);//后缀名

			let dir_realy = path.join(__dirname, '../../locati/');
			let dirpath = dir_realy + curTime + "/";
			if (!fs.existsSync(dirpath)){
				fs.mkdirSync(dirpath);
			}

			let rr = md5(uri);
			let filename = dirpath + rr + "." +suffix;

			let realBack = () =>{
				callback("/locati/" + curTime + "/" + rr + "." +suffix);
			};

			request({uri: uri, encoding: 'binary'}, function (error, response, body) {
				if (!error && response.statusCode === 200) {
					fs.writeFile(filename, body, 'binary', function (err) {
						if (err) {console.log(err);}
					});
					realBack()
				}
			});

			// request(uri).pipe(fs.createWriteStream(filename)).on('close', realBack);

		});
	}catch(e){
		console.log(e)
	}
};

module.exports = download;

// download('http://images.haiwainet.cn/2018/0228/20180228104423156.jpg',(filename)=>{
// 	console.log(filename)
// })