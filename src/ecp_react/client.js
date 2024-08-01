import WxPrinter from './wxprn.js'

﻿class Client {
	
	mode = myService.mode;
	eid  = myService.eid;
	token= myService.token;       /* 服务ID或项目ID */
	api_token = ''                /* API模式调用action的token */
	
	_barcode = 0;
	_barcode_prefix='9';
	
	/* 终端登录, FIXME: 目前仅仅记录相关参数 */
	login=(obj)=>{ 
		if (this.mode==Service.mode.dev) return;
		this.mode    = Service.mode.atm;
		this.term_id = obj.term_id;
		this.dologin();
	}
	
	dologin=()=>{
		const {eid, token, term_id}=this;
		const data={eid, service:token, term_id};
		return new Promise((resolved, reject) =>{
			fetch('/crm/api/auth', {
				method: "POST", 
				credentials: "include",
				body: JSON.stringify(data)
			}).then((res)=>res.json()).then(
				(rc)=>{ 
					if (rc.rc=='ok' || rc.rc=='OK') {
						this.api_token=rc.token;
						resolved(rc); 
					}else reject(rc.errmsg); 
				}
			).catch((err)=>reject(err));
		});
	}

	init(obj, ready) {
		return new Promise((resolved, reject)=>{
			switch(myClient.type) {
				case 'WX':
					if (!myClient.config) {
						resolved();
						break;
					}	
					var wxjs_config=myClient.config;
					wxjs_config.jsApiList=['closeWindow'].concat(obj.wxApiList);
					
					if (typeof wx=='undefined') {
						alert('请引用微信 WxJsSDK: https://res.wx.qq.com/open/js/jweixin-1.0.0.js)');
					}
					wx.ready( function(){
						resolved();
					});
					wx.config(wxjs_config);
					this.wx=wx;
					break;
				case 'Alipay':
					break;
				case 'ECP':
				case 'M-PREVIEW':
					this.ECPM=require('./ECPM.js').ECPM;
					window.ECPM=this.ECPM;
					resolved();
					break;
				case 'SIM':
				case 'PREVIEW':
					resolved();
					break;
			}
		})
	}
	
	get type() {
		return myClient.type;
	}
	
	
	getEid() {
		return this.eid;
	}
	
	getSid() {
		return this.token;
	}	
	
	close=(rc)=>{
		switch(myClient.type) {
			case 'WX':
				wx.closeWindow();
				break;
			case 'Alipay':
				break;
			case 'ECP':
			case 'M-PREVIEW':
				this.ECPM.finish(rc);
				break;
			case 'SIM':
				parent.showHome();
				break;
			case 'PREVIEW':
				parent.Main.closePage();	
				break;
		}
	}
	
	getLocation=(type)=> {
		return new Promise((resolved, reject)=>{
			switch(myClient.type) {
				case 'WX':
					wx.getLocation({
						type:'gcj02'
						, success:function(res) {
								const lat = res.latitude;  //纬度，浮点数，范围为90 ~ -90
								const lng = res.longitude; //经度，浮点数，范围为180 ~ -180。
								const label='地址定位';
								resolved({lat, lng, coor:type, label});
							}
						, cancel:function(res) {
								reject('用户拒绝定位');
							}	
					});
					break;
				case 'Alipay':
					reject('NOT implement');
					break;
				case 'ECP':
				case 'M-PREVIEW':
					this.ECPM.getLocation((loc)=>resolved(loc), type);
					break;
				case 'SIM':
				case 'PREVIEW':
					resolved({lng:104.066002, lat:30.6574, coor:"BD09LL", label:"TEST1 addr"});
					break;
			}
		})
	}
	
	/*开始录音*/
	startRecord=()=>{
		switch(myClient.type) {
			case 'WX':
				wx.startRecord();
				break;
		}
	}
	
	/*停止录音*/
	stopRecord=(obj)=>{
		switch(myClient.type) {
			case 'WX':
				wx.stopRecord(obj);
				break;
		}
	}
	
	/*语音识别*/
	translateVoice=(obj)=>{
		switch(myClient.type) {
			case 'WX':
				wx.translateVoice(obj)
				break;
		}
	}
	
	/*scan barcode */
	scanCode=(option)=>{
		return new Promise((resolved, reject)=>{
			switch(myClient.type) {
				case 'WX':
					wx.scanQRCode({
						needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
						scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
						success: function (res) {
							const code=res.resultStr.split(',');
							if (code.length==2) resolved(code[1]);
							else resolved(code[0]);
						}
					})
					break;
				case 'ECP':
				case 'M-PREVIEW':
					this.ECPM.getMatrixcode((code)=>resolved(code));
					break;				
				case 'SIM':
				case 'PREVIEW':
					{
						this._barcode++;
						const bstr=this._barcode.toString();
						const pad='000000000000';
						resolved(this._barcode_prefix + pad.substr(0, 12-bstr.length)+bstr);
					}	
					break;
			}
		});	
	}
	
	/**
	 * option= { 'camera':bool, 'album':bool, 'idcard':bool}
	 * default: use camera.
	 */
	chooseImage=(cnt=1, option={})=>{
		switch(myClient.type) {
			case 'WX':
				return new Promise((resolve, reject)=>{
					const source=[];
					if (option['idcard']==true) source.push('camera');
					else {
						if (option['camera']!==false ) source.push('camera');
						if (option['album']) source.push('album');
					}
					wx.chooseImage({
						count: cnt,  //上传数量，最多3张。
						sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
						sourceType: source, // 可以指定来源是相册还是相机，默认二者都有
						success: async (res)=>{
							if (res.errMsg!='chooseImage:ok') reject(res.errMsg);
							const photoIds=[];
							for(let i=0; i<res.localIds.length; i++) {
								const sid=await new Promise((resolve, reject)=>{
										wx.uploadImage({
												localId : res.localIds[i] ,
												isShowProgressTips: 1, // 默认为1，显示进度提示
												success: (res)=>{  
														if (res.errMsg=='uploadImage:ok') resolve(res.serverId);
														else reject(res.errMsg);
												}
										});
									})
								photoIds.push(sid);
							}
							resolve(photoIds);
						}
					});
				})
				break;
			case 'ECP':
			case 'M-PREVIEW':
				return new Promise((resolved, reject)=>{
					this.ECPM.chooseImage(d=>resolved(JSON.parse(d).map(o=>o.data)), option);
				});
				break;
			case 'SIM':
			case 'PREVIEW':
				return new Promise((resolved, reject)=>{
					if (option['idcard']) resolved(['idcard.jpg']);
					else resolved(['photo.jpg']);
				});
				break;
		}		
	}
	
	/*初始化打印标签*/
	initPrinter=()=>{
		switch(myClient.type) {
			case 'WX':
				return WxPrinter.init(); 
				break;
			case 'ECP':
			case 'M-PREVIEW':
				return new Promise((resolved, reject)=>{
					this.ECPM.initPrinter((prn, o)=>{
						let rc=JSON.parse(o);
						if (rc.rc=='ERR') {
							reject(rc.msg);
							return;
						}
						resolved(prn);
					})
				});
				break;				
			case 'SIM':
			case 'PREVIEW':
				return new Promise((resolved, reject)=>{
					resolved(false);
				});
				break;
		}	
	}
		
	/**
	 * 转换Page页面 
	 */
	page=(page)=>{
		switch(this.mode) {
			case Service.mode.dev:
				return '/odt/service/preview?p_serial='+this.token+'&file='+'/page/'+page;
			case Service.mode.www:
			case Service.mode.ecp:
				return '/crm/weixin/page/eid/'+this.eid+'/service/'+this.token+'/file/'+encodeURIComponent(page);
			case Service.mode.wx:
				return '/crm/weixin/page/file/'+encodeURIComponent(page)+'?eid='+this.eid+'&service='+this.token;
		}		
	}
	
	/** 
	 * 微信认证页面
	 */
	authPage=(page)=>{
		return '';
	}
	
	icon=(url)=>{
		switch(this.mode) {
			case Service.mode.dev:
				return '/odt/service/meta-file/p_serial/'+this.token+'/file/'+encodeURIComponent(url);
			case Service.mode.www:
			case Service.mode.ecp:
			case Service.mode.atm:
				return '/crm/util/meta-file/eid/'+this.eid+'/serviceid/'+this.token+'/file/'+encodeURIComponent(url);
			case Service.mode.wx:	
				// 这个写法在微信测试环境会出现问题。
				//return '/crm/util/meta-file/eid/'+this.eid+'/serviceid/'+this.token+'/file/'+encodeURIComponent(url);
				//console.log(window.location);
				return '../../../util/meta-file/eid/'+this.eid+'/serviceid/'+this.token+'/file/'+encodeURIComponent(url);
		}		
	}
	
	url=(url)=>{
		return this.icon('/page/'+url);
	}
	
	data_url=(url)=>{
		return this.icon('/data/'+url);
	}
	
	/* 运行服务的Action */
	run=(actname, data)=>{
		let url;
		switch(this.mode) {
			case Service.mode.dev:
				url='/odt/service/action?p_serial='+this.token+'&do='+encodeURIComponent(actname)+'&format=json';
				break;
			case Service.mode.www:
				url='/crm/www/action?do='+encodeURIComponent(actname)+'&service='+this.token+'&format=json';
				break;
			case Service.mode.ecp:
			case Service.mode.wx:
				url='../../../weixin/action?do='+encodeURIComponent(actname)+'&format=json';
				break;
			case Service.mode.atm:
				url='../../../api/action?do='+encodeURIComponent(actname)+'&token='+this.api_token+'&format=json';	
		}
		
		if (!data) data={}
		
		var doCall=(resolved, reject)=>{
			fetch(url, {
					method: "POST", 
					credentials: "include",
					body: JSON.stringify(data)
				}).then((res)=>res.json()).then(
					(rc)=>{ 
						if (rc.rc=='ok' || rc.rc=='OK') resolved(rc); 
						else if (rc.rc=='AUTH-RETRY') {
							//
							// token expirted 
							// login to Get New token 
							//
							this.dologin().then(()=>doCall(resolved, reject));
						}
						else reject(rc.errmsg); 
					}
				).catch((err)=>reject(err));
		}
		
		return new Promise((resolved, reject) =>{
			doCall(resolved, reject);		
		});
	}
}

Service.mode={
	dev : 0,
	www : 1,
	wx  : 2,
	ecp : 3,
	atm : 4           /* auto teller machine */
}

export default new Client();
