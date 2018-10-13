var express = require('express');
var router = express.Router();

var mysql = require('mysql');

var pool = mysql.createPool({
	host:"127.0.0.1",
	port:3306,
	user:"root",
	password:"",
	database:"baobao",
	connectTimeout:3000
});

var SQL = {
	insertRecord:'INSERT INTO record(action,time,uid) VALUES(?,?,?)',
	queryAllRecordByUid:'SELECT * FROM record where uid = ? order by time desc',
	getUserById:'SELECT * FROM User WHERE uid = ? '
};


var query=function(sql,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,function(qerr,vals,fields){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr,vals,fields);
            });
        }
    });
};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});


router.post('/record', function (req, res, next) {
    var data = req.body;
    // var start = new Date().getTime();
    console.log(new Date(), 'jsonBody', data);
    pool.getConnection(function(err, connection){
    	connection.query(SQL.insertRecord, [data.action, data.time, data.uid], function(err, result){
			if(result) {      
             	result = {   
                    code: 200,   
                    msg:'增加成功'
            	}
            	res.send(result);
        	}
        	if(err) {
        		res.send(err);
        	}
        	connection.release();
    	});
    	if(err) {
    		res.send(err)
    	}
    });
});

router.post('/record/list', function(req, res, next){
	var data = req.body;
	console.log(new Date(), "body:" , data);
	pool.getConnection(function(err, connection){
		connection.query(SQL.queryAllRecordByUid, [data.uid], function(err, result){
			if(result) {
				res.send(result);
			}
			if(err) {
				res.send(err);
			}
			connection.release();
		});
		if(err) {
			res.send(err);
		}
	});
});

function getIP(req) {
    var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
    return ip;
}

module.exports = router;
