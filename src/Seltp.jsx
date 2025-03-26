import React from 'react';
import {Form, Button, DivWin as W, Grid as G, InputButton, Toolbar, net } from 'ecp';
import LabelGallery from './LabelGallery.jsx'
import tp_utils from './tp_utils.js'
import {_} from "./locale.js";

class Login extends React.Component{

	state={
		formvalue : {}
	}
		
	onChange=(formvalue)=>{
		this.setState({formvalue});
	}
	
	doLogin=(e)=>{
		const {formvalue}=this.state
		net.post('/api/login', formvalue)
			.then((rc)=>{
				this.props.onLogin(rc.userinfo);
			}).catch((e)=>W.alert(e));
	}
	
	doReg=(e)=>{
		window.location.href='/views/usercenter/register.html';
	}
	
	render() {
		const login_fields=[
			{name:_('用户名'), id:'userid'},
			{name:_('密码'),   id:'passwd',  type:'password'},
		];
	
		let {formvalue}=this.state;
		
		return <div className="center">
			<div className="login">
				<Form fields={login_fields} nCol={1} border={false} 
					values={formvalue} onChange={this.onChange}/>
				<Button type="submit" onClick={this.doLogin}>{_("登录")}</Button>
				<Button type="blue" onClick={this.doReg}>{_("注册")}</Button>
			</div>
		</div>
	}
}

function Tpinfo(props) {
  const {tpinfo, onNext, onResel}=props
  const onEdit=()=>{
    window.location.href=`/designer/${tpinfo.id}`
  }
  
  return (
	<G.Row>
		<G.Col width="40%" className="tp-img-div">
			<img  className="tp-img-big" alt="tp-img-big" src={`/utils/thumb?id=${tpinfo.id}`}/>
		</G.Col>
		<G.Col width="50%" className="tp-info">
		    <Toolbar>
    		    <Button type="green" onClick={onNext}>{_("下一步")}</Button>
    		    <Button onClick={onEdit}>{_("编辑")}</Button>
    		    <Button onClick={onResel}>{_("重选")}</Button>
    		</Toolbar>
    		<hr/>
			<p><span className="tp-head-item">{_("名称:")}</span>{tpinfo.name} </p>
			<p><span className="tp-head-item">{_("说明:")}</span>{tpinfo.memo} </p>
			<p><span className="tp-head-item">{_("尺寸:")}</span>{tpinfo.width/10}{_("厘米")} X {tpinfo.height/10}{_("厘米")}</p>
			<br/>
			<p className="tp-head-variable">{_("模板变量")}</p>
			<div className="tp-varialbe-container">{props.tp_vars.map((o,i)=><p key={i} className="tp-variable">{o}</p>)}</div>
		</G.Col>
	</G.Row>)
}

class Seltp extends React.Component {
   
    constructor(props) {
		super(props);
		this.state={
			search_key : "",
			owner : "all",
			logged : false,
			sel_win : false, 
			sel_type: ''
		}
    }
    
    componentDidMount=()=>{
    	this.props.setStep("seltp")
		this.loadUserinfo();
		let {id}=this.props.match.params;
		
		if (id) {
			this.do_seltp(id);
		}else{
		    let {tpid}=this.props.tpdata;
			if (tpid) this.do_seltp(tpid);
		}
    }
    
    loadUserinfo=()=>{
    	net.get('/api/userinfo')
		.then((rc)=>{
			this.setState({logged:true, owner:'mine', userinfo:rc.userinfo});
		})
		.catch((e)=>{})
    };
    
    onLogin=(userinfo)=>{
    	this.setState({logged:true, owner:'mine', userinfo});
    }
    
    loadtp=async(tpid)=>{
    	let rc=await net.get(`/api/load-template?id=${tpid}`);
    	let tp_vars=tp_utils.get_vars(rc.data);
		this.props.onChangeTp({tpid, tpinfo:rc.tpinfo, tp_vars});
    }
    
    nextStep=()=>{
		const {tpdata}=this.props;
    	const {tpinfo, tp_vars}=tpdata;
    	
    	if (!window.SPIRIT) {
        	W.alert(_("请先安装打印插件"));
    		return;
    	}
    	
    	if (!tpinfo) {
    		W.alert(_("请先选择打印模版"));
    		return;
    	}
    	if (!tp_vars || tp_vars.length===0) {
			
    		W.confirm(_("模版没有需要绑定的变量!"), 
    			()=>this.props.history.push("/print-tools/doprint")
    		)
    	}else if (tp_utils.get_var_cnt(tp_vars)==0) {
			this.props.history.push("/print-tools/doprint")
		}else{
	    	this.props.history.push("/print-tools/loaddata");
	    }
    }
    
    do_seltp=async (tpid)=>{
    	this.loadtp(tpid);
    	this.setState({tpid, selected:true});
    }
    
    edit=(record)=>{
    	window.location.href=`/designer/${record.id}`;
    }
    
    dosearch=(search_key)=>{
    	this.setState({search_key})
    }
    
    onChgOwner=(owner)=>{
    	this.setState({owner});
    }
    
    useShares = ()=>{
        this.setState({sel_win:true, sel_type:'shares'});
    }
    
    useMine = ()=>{
        this.setState({sel_win:true, sel_type:'mine'});
    }
    
    useLocal = () =>{
       W.alert(_("该功能暂未实现"))
    }
    
    returnIndex=()=>{
        this.setState({sel_win:false, selected:false});   
    }
    
    reSel=()=>{
        this.setState({selected:false});   
    }
	
	create=()=>{
		window.open(`/designer`, "_blank")
	}
    
    render() { 
    	const {search_key, logged, selected, sel_win, sel_type}=this.state;
    	const {tpdata}=this.props;
    	const {tpinfo, tp_vars}=tpdata;
		const {id}=this.props.match.params;
    	return (
		<>
		{ selected ? (tpinfo && <Tpinfo tpinfo={tpinfo} tp_vars={tp_vars} onNext={this.nextStep} onResel={this.reSel}/>):
		    (
		        sel_win?
		        <div className="sel-tp-win">
    		        <G.Row>
	        			<G.Col style={{margin:"0 auto", padding:10, paddingBottom:20}}>
	        				<InputButton no_empty={false} defaultValue={search_key} onClick={this.dosearch} style={{display:'inline'}}>{_("搜索")}</InputButton>
	        				<Button onClick={this.returnIndex}>{_("返回")}</Button>
	        			</G.Col>
	        		</G.Row> 
	        		<div>
		                {sel_type==='shares' && <LabelGallery type="shares" search={search_key} onSelTp={this.do_seltp}/> }
				        {sel_type==='mine' && (
				            logged ? 
				                <LabelGallery type="mine" search={search_key} onSelTp={this.do_seltp}/>
				                :
            					<Login onLogin={this.onLogin} />)}
            		</div>
                </div>
                :
		        <div>
    		        <div className="lpts-intro">
					    {_("LPTS介绍")}
				    </div>
					<div className="sel-tp-index">
					    
						<div onClick={this.useShares}>
							<div className="sel-tp sel-tp-yun"/>
							<div className="sel-tp-title">{_("共享云标签")}</div>
						</div>
						<div onClick={this.useMine}>
							<div className="sel-tp sel-tp-mine"/>
							<div className="sel-tp-title">{_("我的标签")}</div>
						</div>
						<div onClick={this.create}>
							<div className="sel-tp sel-tp-local"/>
							<div className="sel-tp-title">{_("新建标签")}</div>
						</div>
					</div>
					<div style={{textAlign:'center'}}>
						<a href="https://www.github.com/printspirit/lpts">{_("该项目已在GitHub上开源")}</a>
					</div>
				</div>
		    )
		}
		</>
    	);
    }
}

export default Seltp
