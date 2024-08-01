const  Svr=myService;

Svr.connect=function(cb) {
	/* 连接到服务/如果认证状态发生变化，触发cb */
	this.onStateChange=cb;
	/* 启动时检测当前的登陆状态*/
	this.checkAuth();
}

Svr.run=function(actname, data) {
	return new Promise(	(resolved, reject)=>{
		try{
			this.runAction(actname, data, 
				(rc)=>{
					resolved(rc);
				},
				(rc)=>{
					reject(rc.msg);
				}
			)
		}catch(e) {
			reject(e);
		}	
	});
}

export default Svr;

