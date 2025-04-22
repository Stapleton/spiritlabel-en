import React from 'react';
import {DivWin as W} from 'ecp';
import {_} from "./locale.js";
import "./login.css"

const PASS=1
const WX = 2

class Login extends React.Component {
	
	state={
	    type : WX,
	    wx_auth_url : '',
		userid  : '',
		passwd  : '',
	}
	
	login_handler = async(evt)=>{
		if (evt.origin !== "https://www.printspirit.cn") {
			return;
		}
		
		if (evt.data) {
			let data = await this.Post("/api/wxlogin", evt.data)
			if (data.rc==="ERR") {
				W.alert(_("登录不成功: ") + data.errmsg);
				return;
			}
			this.props.onLogin(true, data.userinfo);
			this.props.dialog.close()
			if (typeof this.props.postlogin==="function") {
			    this.props.postlogin()
			}
		}
	}
	
	componentDidMount=async () => {
		await this.show_login_win()
		window.addEventListener('message', this.login_handler)
	}
	
	componentWillUnmount() {
		window.removeEventListener('message', this.login_handler);
	}
		
	Post=(url, data)=>{
	    const formData = new URLSearchParams(data);
    	return fetch(url,  {
				method: 'POST',
				credentials: 'same-origin',
				body: formData,
				headers: {
				    'Content-Type': 'application/x-www-form-urlencoded'
				},
		}).then((response)=>{
				return response.json();
		})    
	}
	
	passlogin=()=>{
		const {userid, passwd}=this.state;
		let url;
		
		url='/api/login';
		
		fetch(url,  {
				method: 'POST',
				credentials: 'same-origin',
				body: JSON.stringify({userid, passwd})
		}).then((response)=>{
				return response.json();
		}).then((rc)=>{
				if (rc.rc==='OK') {
					this.props.onLogin(true, rc.userinfo);
					this.props.dialog.close()
					if (typeof this.props.postlogin==="function") {
					    this.props.postlogin()
        			}
				}else{
					W.alert(_("登录不成功: ") + rc.errmsg);
				}
		});
	}
		
	show_login_win=async ()=>{
	    let data = await this.Post("/api/wxlogin-get-param", {})
	    var wx_auth_url = "https://open.weixin.qq.com/connect/qrconnect?appid=" + data.appid + "&scope=snsapi_login&redirect_uri="
	        +encodeURIComponent("https://www.printspirit.cn/wx-login-cb?callback=1")+"&state=" + data.state + 
	        "&login_type=jssdk&self_redirect=true&styletype=&stylelite=1&sizetype=&bgcolor=black&rst=";
	    this.setState({wx_auth_url})
	}
	
	usePass=()=>{
	    this.setState({type:PASS})
	}
	
	useWx=()=>{
	    this.setState({type:WX})
	    this.show_login_win()
	}
			
	render() {
		const { type, wx_auth_url, userid, passwd}=this.state;
		return (
			<div style={{textAlign:"center", marginTop:10}}>
			    {type===PASS && 
			    <div  className="mb-3" style={{height:240, width:200, margin:"0 auto"}}>				
			        <div className="form-group">
				        <label >{_("用户名")}</label>
				        <input value={userid} onChange={e=>this.setState({userid:e.target.value})}/>
			        </div>
			        <div className="form-group">
				        <label>{_("密码")}</label>
				        <input type="password" value={passwd} onChange={e=>this.setState({passwd:e.target.value})}/>
			        </div>
			        <button type="button" className="btn btn-primary" onClick={this.passlogin}>{_("登录")}</button>
			    </div>}
    			{type===WX && 
    			    <div class="mt-3" style={{height:240}}> 
    			       <div class="mb-2"><i className='web_qrcode_tips_logo small'></i>请使用微信扫一扫登录</div>
    			       {wx_auth_url &&  <iframe title="login" src={wx_auth_url} width="200px" height="220px" allowTransparency = "true" frameBorder = "0" />}
    			    </div>
    			}
    			<div  style={{"fontSize":18}}>
    			    {type===WX ? 
    			        <span onClick={this.usePass}>切换为密码登录</span>
    			        :
    			        <span onClick={this.useWx}><i className='web_qrcode_tips_logo'></i>切换为微信登录</span> }
    			</div>
			</div>
		);
	}
}   

export default Login
