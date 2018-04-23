var mysql = require("mysql");
const config = require("./dbConfig");

var pool = null;
var defaultCallback = () => {
};

function query(sql, callback) {
	pool.getConnection(function (err, conn) {
		if (err) {
			callback(err, null, null);
		} else {
			conn.query(sql, function (qerr, vals, fields) {
				//释放连接
				conn.release();
				//事件驱动回调
				callback(qerr, vals, fields);
			});
		}
	});
};

exports.init = function () {
	pool = mysql.createPool({
		host: config.HOST,
		user: config.USER,
		password: config.PSWD,
		database: config.DB,
		port: config.PORT,
	});
};

exports.findArticleById = function (aid, callback = defaultCallback) {
	
	if (aid === null) {
		callback(false);
		return;
	}
	
	var sql = 'SELECT * FROM t_article WHERE id = "' + aid + '"';
	query(sql, function (err, rows, fields) {
		if (err) {
			callback({});
		}
		else {
			if (rows.length > 0) {
				console.log(rows);
				callback(true);
			}
			else {
				callback({});
			}
		}
	});
};

exports.insertArticle = function (article, callback = defaultCallback) {
	
	if (article === null) {
		callback(false);
		return;
	}
	
	let addSql = 'insert into `article`.`t_article` ( `description`, `name`, `author`, `category_id`, `header`, `content`) values ( ?, ?, ?, ?, ?, ?);';
	let addParams = [article.description, article.name, article.author, article.category_id, article.header, article.content];
	let sql = mysql.format(addSql, addParams);
	
	query(sql, function (err, result, fields) {
		if (err) {
			callback({});
		}
		else {
			
			console.log('INSERT ID:', result);
			callback(true);
			
		}
	});
};

exports.findVideoById = function (vid, callback = defaultCallback) {
	
	if (vid === null) {
		callback(false);
		return;
	}
	
	let addSql = 'select * from `article`.`t_video` where `id` = ?';
	let addParams = [vid];
	let sql = mysql.format(addSql, addParams);
	
	query(sql, function (err, rows, fields) {
		if (err) {
			callback(false);
		}
		else {
			if (rows.length > 0) {
				callback(rows[0]);
			}
			else {
				callback(false);
			}
			
		}
	});
};

exports.insertVideo = function (video, callback = defaultCallback) {
	
	if (video === null) {
		callback(false);
		return;
	}
	
	let addSql = 'insert into `article`.`t_video` ( `id`, `url`, `category_id`, `icon`, `name`) values' +
		' ( ?, ?, ?, ?, ? );';
	let addParams = [video.id, video.url, video.category_id, video.icon, video.name];
	let sql = mysql.format(addSql, addParams);
	
	this.findVideoById(video.id, (result) => {
		if (result === false) {
			query(sql, function (err, result, fields) {
				if (err) {
					callback({});
					
				}
				else {
					console.log('INSERT ID:', result);
					callback(true);
				}
			});
		} else {
			console.log("已经存在");
		}
	})
};

exports.findAllCache = function (read, callback = defaultCallback) {
	
	if (read === null) {
		callback(false);
		return;
	}
	
	let addSql = 'select * from `cache` where `read` = ?;';
	let addParams = [read];
	
	let sql = mysql.format(addSql, addParams);
	
	query(sql, function (err, rows, fields) {
		if (err) {
			callback(false);
		}
		else {
			callback(rows);
		}
	});
};
// 查找缓存记录
exports.findCacheByUrl = function (url, callback = defaultCallback) {
	
	if (url === null) {
		callback(false);
		return;
	}
	
	let addSql = 'select * from `cache` where `url` = ?;';
	let addParams = [url];
	
	let sql = mysql.format(addSql, addParams);
	
	query(sql, function (err, rows, fields) {
		if (err) {
			callback(false);
		}
		else {
			if (rows.length > 0) {
				callback(rows[0]);
			}
			else {
				callback(false);
			}
			
		}
	});
};

// 记录缓存，并且记录parentLevel
exports.insertCache = function (url, parentLevel = '[]', callback = defaultCallback) {
	
	if (url === null) {
		callback(false);
		return;
	}
	let addSql = 'insert into `cache` ( `url`, `read`, `level`) values ( ? , 0, ?);';
	let addParams = [url, parentLevel];
	let sql = mysql.format(addSql, addParams);
	
	this.findCacheByUrl(url, (result) => {
		if (result === false) {
			query(sql, function (err, result, fields) {
				if (err) {
					callback({});
				}
				else {
					callback(true);
				}
			});
		}
	})
};

exports.setUrlCacheHasRead = function (url, callback = defaultCallback) {
	
	if (url === null) {
		callback(false);
		return;
	}
	let addSql = 'update `article`.`cache` set `read`=b\'1\' where `url`= ?;';
	let addParams = [url];
	let sql = mysql.format(addSql, addParams);
	
	this.findCacheByUrl(url, (result) => {
		if (result !== false) {
			query(sql, function (err, result, fields) {
				if (err) {
					callback({});
				}
				else {
					callback(true);
				}
			});
		}
	})
};