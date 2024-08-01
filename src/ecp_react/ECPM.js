/*定义手机相关函数*/
//if (typeof _ECPM === 'undefined') throw '请使用ECP APP';

var ECPM = ECPM  || {};
ECPM.cb_list = ECPM.cb_list ||{};
ECPM.cb_fun_idx=0;

ECPM.valid=function(funname) {
	if (typeof _ECPM!='undefined' &&  
		(!funname ||typeof _ECPM[funname]=='function') ) return true;
	return false;
};

ECPM.mkCb=function(cb_fun) {
	var idx;	
	if (!cb_fun.uuid) {
		idx=ECPM.cb_fun_idx++;
		if (typeof cb_fun=='function') cb_fun.uuid=idx;
	}else idx=cb_fun.uuid;
	
	ECPM.cb_list[idx]=cb_fun;
	return idx;
};

ECPM.callback=function(cb_fun_idx, data) {
	if (typeof ECPM.cb_list[cb_fun_idx]=='function') ECPM.cb_list[cb_fun_idx](data);
	else eval(ECPM.cb_list[cb_fun_idx]+"('"+data+"')");
};

ECPM.DatePicker=function(cb_fun, init_value) {
	_ECPM.DatePicker(ECPM.mkCb(cb_fun), init_value);
};

ECPM.EcpAttachment=function(cb_fun, data) {
	_ECPM.EcpAttachment(ECPM.mkCb(cb_fun), JSON.stringify(data));
};

ECPM.orgselector=function(conf) {
	var callback=conf.callback;
	conf.callback=ECPM.mkCb(function(data){callback(JSON.parse(data));});
	_ECPM.orgselector(JSON.stringify(conf));
};

ECPM.getMatrixcode=function(cb_fun) {
	_ECPM.getMatrixcode(ECPM.mkCb(cb_fun));
};

ECPM.getBarcode = function(cb_fun){
	_ECPM.getBarCode(ECPM.mkCb(cb_fun));
}

ECPM.setOnBarCodeListener = function(listener){
	var index = ECPM.mkCb(listener);
	_ECPM.setOnBarCodeListener(index);
}

ECPM.getLocation=function(cb_fun, type){
	_ECPM.getLocation(ECPM.mkCb(cb_fun), type);
};

ECPM.close_plugin_win=function() {
	_ECPM.close_plugin_win();
};

/**
 * 显示附件的打开方式
 * @param JSON|Object data 附件数据
 * @param int right 访问权限
 * @param int expirt 过期时间,0不过期
 * @param string digest 校验码
 * @param JSON|Object extraFun 附件的功能格式为：[{name, title, icon, url_type, url_action, param}]
 */
ECPM.att_preview=function(data, right,  expirt, eid, digest, extraFun) {
	if (typeof data == 'object') data=JSON.stringify(data);
	if (typeof extraFun == 'object') extraFun=JSON.stringify(extraFun);
	_ECPM.att_preview(data, right,  expirt, eid, digest, extraFun);
};

ECPM.open=function(title, url, ecp_enhance) {
	if (typeof ecp_enhance=='undefined') ecp_enhance=true;
	_ECPM.open(title, url, ecp_enhance);
};

/*
 * 打开一个新窗口并等待结果 
 * @param string title 窗口标题
 * @param string url 地址
 * @param function(int) 回调函数，回调参数为新窗口，调用ECPM.finish(rc)的rc返回值。
 */
ECPM.openForResult=function(title, url, cb_fun) {
	_ECPM.openForResult(title, url, ECPM.mkCb(cb_fun));
};
ECPM.openActivityForResult=function(action, params, cb_fun) {
	_ECPM.gotoActionForResult(action, params, ECPM.mkCb(cb_fun));
};
ECPM.showToast=function(msg) {
	_ECPM.showToast(msg);
};

ECPM.finish=function(rc) {
	if (!rc) _ECPM.finish();
	else {
		if (typeof rc == 'object') rc=JSON.stringify(rc);
		_ECPM.finish(rc);
	}
};

ECPM.sendAndroidMsg = function(action,params){
	if(typeof params === "object") params = JSON.stringify(params);
	_ECPM.sendAndroidMsg(action,params);
};

ECPM.mqttPublish = function(topic ,payload){
	_ECPM.mqttPublish(topic , payload);
};

ECPM.mqttSubscribe = function(topic ,actionname ,uniqueid){
	_ECPM.mqttSubscribe(topic ,actionname ,uniqueid);
};

ECPM.mqttUnSubscribe = function(topic){
	_ECPM.mqttUnSubscribe(topic);
};

ECPM.initPrinter=function(cb_fun) {
	_label_printer.init(ECPM.mkCb(function(o){
		cb_fun(_label_printer, o);
	}));
}

ECPM.chooseImage=function(cb_fun, option) {
	_ECPM.chooseImage(ECPM.mkCb(cb_fun));
}

export {ECPM as default, ECPM };
