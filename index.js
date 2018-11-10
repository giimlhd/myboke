/*
* @Author: admin
* @Date:   2018-11-05 14:06:27
* @Last Modified by:   admin
* @Last Modified time: 2018-11-10 11:35:47
*/
const express=require('express');
const app=express();

const db=require(`./public/db.js`);

const ejs=require('ejs');
app.set("view engine","ejs");

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })


const http=require('http').Server(app);
const io=require('socket.io')(http);

var session = require('express-session');
// 持久化
var NedbStore = require('nedb-session-store')( session );
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie:{
  	maxAge:20000000
  },
  // 配置持久化
  store: new NedbStore({
      filename: 'path_to_nedb_persistence_file.db'
    })
}))

var arr=new Array();
app.use(`/public`,express.static(`./public`));

/*进入登陆页面*/
app.get(`/`,(req,res)=>{
	if(req.session.login){
		res.render(`send`,{user:req.session.user})
	}else{
		res.render(`login`);
	}
	
})

/*查找数据库中用户名的存在*/
app.get(`/finduser`,(req,res)=>{	
	var obj={
		user:req.query.param1
	}
	db.find('account','account',obj,res,(a)=>{
		if(req.query.param2){
			if(a.length!=0){
				res.send({ok:1});/*发送1给注册页面*/	
			}else{
				res.send({ok:2});/*发送2给注册页面*/	
			}
		}else{
			if(a.length!=0){
				req.session.user=req.query.param1;
				req.session.login=true;
				res.send({ok:1,pass:a[0].pass});/*发送1给登录页面*/	
			}else{
				res.send({ok:0});/*发送0给登录页面*/	
			}
		}
	})
})


/*注册用户*/
app.get(`/insertacc`,(req,res)=>{	
	var obj={
		user:req.query.param1
	}
	db.find('account','account',obj,res,(a)=>{
		if(a.length!=0){
			res.send({num:0})
		}else{
			obj.pass=req.query.param2;
			console.log(obj)
			db.insert('account','account',obj,res,()=>{
				console.log('插入成功！');
				res.send({num:1});
			})
		}
	})
})
app.get(`/goregist`,(req,res)=>{
	res.render(`register`);
})

app.get(`/gosend`,(req,res)=>{
	res.render(`send`,{user:req.session.user});
})

app.post(`/article`,urlencodedParser,(req,res)=>{
	arr=[];
	var obj={
		user:req.session.user,
		title:req.body.title,
		content:req.body.content
	}
	arr.push(obj);
	db.insert('article','article',obj,res,()=>{
		console.log('插入成功！');
		res.send({num:1});
	})

})

app.get(`/gocomment`,(req,res)=>{
	res.render(`comment`,{article:arr[0],user:req.session.user});
})


/*退出登录*/
app.get(`/exit`,(req,res)=>{
	req.session.user=null;
	req.session.login=false;
	console.log(req.session.login);
	res.send({num:1});
})

/*进入个人主页*/
app.get(`/gopersonal`,(req,res)=>{
	var obj={
		user:req.session.user
	}
	console.log(obj)
	db.find('article','article',obj,res,(a)=>{
		console.log(a);
		res.render(`personal`,{art:a,user:req.session.user});
	})
	
})

io.on("connection",(socket)=>{
	socket.on("comfir",(msg)=>{
		console.log(msg);
		io.emit("comsec",msg);
	})
})

http.listen(8080,()=>{
	console.log('启动...')
})


















