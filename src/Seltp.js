import React from 'react';
import {Table, Form, Button, H3, DivWin as W, Grid as G, InputButton, Tabs, net } from 'ecp';
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
		
		return <div class="center">
			<div className="login">
				<Form fields={login_fields} nCol={1} border={false} 
					values={formvalue} onChange={this.onChange}/>
				<Button type="submit" onClick={this.doLogin}>登录</Button>
				<Button type="blue" onClick={this.doReg}>注册</Button>
			</div>
		</div>
	}
}

function Tpinfo(props) {
  const {tpinfo}=props
  return (
	<G.Row>
		<G.Col width="40%" >
			<img  class="tp-img-big" alt="tp-img-big" src={`/utils/thumb?id=${tpinfo.id}`}/>
		</G.Col>
		<G.Col width="50%" >
			<p><span>名称:</span>{tpinfo.name} </p>
			<p><span>说明:</span>{tpinfo.memo} </p>
			<p><span>尺寸:</span>{tpinfo.width/10}厘米 X {tpinfo.height/10}厘米 </p>
			<br/>
			<p>模板变量</p>
			{props.tp_vars.map((o,i)=><p key={i}>{o}</p>)}
		</G.Col>
	</G.Row>)
}

class Seltp extends React.Component {
   
    constructor(props) {
			super(props);
			this.columns = [ 
				{title: _('名称'), key: 'name'}, 
				{title: _('说明'), key: 'memo'}, 
				{title: _('图片'), key: 'id', tp: (v,r)=><img class="tp-img" alt="tp-img" data-id={v} onClick={this.seltp2} src={`/utils/thumb?id=${v}`}/>
			}];
			this.state={
						search_key : "",
						owner : "all",
						logged : false,
			}
    }
    
    componentDidMount=()=>{
    	this.props.setStep("seltp")
    	this.loadUserinfo();
    	if (this.props.tpid) this.loadtp(this.props.tpid);
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
    	if (!tpinfo) {
    		W.alert(_("请先选择打印模版"));
    		return;
    	}
    	if (!tp_vars || tp_vars.length===0) {
    		W.confirm(_("模版没有需要绑定的变量!\n仍然要打印吗？"), 
    			()=>this.props.history.push("/print-tools/doprint")
    		)
    	}else{
	    	this.props.history.push("/print-tools/loaddata");
	    }
    }
    
    seltp1=(record)=>{
    	this.do_seltp(record.id)
    }
    
    seltp2=(e)=>{
    	this.do_seltp(e.target.getAttribute('data-id'));
    }
    
    do_seltp=async (tpid)=>{
    	this.setState({tpid});
    	let rc=await net.get(`/api/load-template?id=${tpid}`);
    	let tp_vars=tp_utils.get_vars(rc.data);
    	this.props.onChangeTp({tpid, tpinfo:rc.tpinfo, tp_vars});
    }
    
    edit=(record)=>{
    	window.location.href=`/designer/${record.id}`;
    }
    
    dosearch=(search_key)=>{
    	this.setState({search_key})
    }
    
    actions=(tabObj, record)=>{
        return(
            <span>
                <Button type='inline' onClick={()=>this.seltp1(record)}>选择</Button>
                <Button type='inline' onClick={()=>this.edit(record)}>编辑</Button>
            </span>
        )
    }
    
    onChgOwner=(owner)=>{
    	this.setState({owner});
    }
    
    render() { 
    	const {search_key, owner, logged}=this.state;
    	const {tpdata}=this.props;
    	const {tpinfo, tp_vars}=tpdata;
    	return (
    	   <>
					<G.Row>
						<G.Col style={{margin:"0 auto", paddingBottom:20}}>
							<InputButton no_empty={false} onClick={this.dosearch} >{_("搜索")}</InputButton>
						</G.Col>
					</G.Row>     
					<G.Row>
    	   		<G.Col width='50%' class="tp-list">
    	   			<H3>{_("可用标签模版列表")}</H3>
    	   			<Tabs highlight onChange={this.onChgOwner} activeKey={owner} >
    	   				<Tabs.Page key={'all'} title={_("共享模板")}>
	    	   				<Table dataUrl={`/api/get-tp-list?all=1&key=${search_key}`} 
  	  	   					columns={this.columns} actions={this.actions} pg_size={4} />
    	   				</Tabs.Page>
    	   				<Tabs.Page key={'mine'} title={_("我的模板")}>
    	   					{ logged ?
		    	   				<Table dataUrl={`/api/get-tp-list?key=${search_key}`} 
  		  	   					columns={this.columns} actions={this.actions} pg_size={4} /> :
  		  	   				<Login onLogin={this.onLogin} />
  		  	   			}
    	   				</Tabs.Page>
    	   			</Tabs>
    	   		</G.Col>
    	   		<G.Col width='50%' class="tp-info" >
    	   			<div >
 	   	   			<H3>{_("已选模版")}</H3>
    	   				{tpinfo ? <Tpinfo tpinfo={tpinfo} tp_vars={tp_vars} /> : _("请选择标签模版") }
    	   			</div>
    	   		</G.Col>	
    	   	</G.Row>
    	   	<hr/>
    	   	<div style={{float:"right"}}>
    	   		<Button onClick={this.nextStep}>{_("下一步")}</Button>
    	   	</div>
	   </>
    	);
    }
}

export default Seltp
