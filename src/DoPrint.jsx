import React from 'react';
import {H1, Grid as G, Button, DivWin as W, Form, Warning, Error, Info } from 'ecp';
import {loadjs} from 'ecp/util'
import {_} from "./locale.js";

// 将独立的ns1.ns2...key1变量按ns组合起来：
// 如：{ns1.key1:v1, ns1.key2:v2} => {ns1:{key1:v1, key2:v2}}
function merge_var(row) {
    let r={}
	let keys=Object.keys(row);
	keys.forEach((varname)=>{
		let ns = varname.split('.');
		let vp = r;
		for (let i=0;i< ns.length - 1; i++) {
			if (!(ns[i] in vp)) vp[ns[i]]={};
				vp=vp[ns[i]];
			}	
		vp[ns[ns.length -1]]=row[varname];
	})
	return r;
}

class DoPrint extends React.Component {

	/* 状态 */
	state={
		prnlst : [],     /* 全部可用打印机 */ 
		cur_prnlst : [], /* 当前类型可用打印机*/
		info: null 
	}
	
	constructor(props) {
		super(props);
		props.setStep("doprint")
		if (!props.tpdata.tpid) this.props.history.push("/print-tools/seltp")
	}

	nextStep=()=>{
		this.props.history.push("/print-tools/finish");
	}
	
	prevStep=()=>{
		this.props.history.push("/print-tools/loaddata")
	}
		
	print=()=>{
		let {tpdata, data}=this.props;
		if (data.length===0) return;
		
		if (!window.SPIRIT) {
			W.alert(_("打印机未准备就绪!\n请检查是否未安装\"打印精灵\""));
			return;
		}
		
		var getVars=(idx)=>{
			if (idx>0) return null;
			if (tpdata.tp_vars.length===0) {
				return {}
			}else{
				return merge_var(data[0]);
			}
		}
		
		this.doPrint(tpdata.tpid, getVars);
	}
	
	setTemplateUrl=()=>{
		let {protocol, host}=window.location
		window.SPIRIT.setUrl(`${protocol}//${host}/api/load-template?id=`)
	}
		
	printAll=()=>{
		let {tpdata, data, sql}=this.props;
		if (data.length===0) return;
		
		if (!window.SPIRIT) {
			W.alert(_("打印机未准备就绪!\n请检查是否未安装\"打印精灵\""));
			return;
		}
		
		if (sql) {
			return this.printBySql(sql, tpdata.tpid, this.nextStep)
		}
		
		let {copys}=this.props.print_opts;
		
		var getVars=(idx)=>{
			if (tpdata.tp_vars.length===0) {
				/* 非变量模式，按打印份数打印*/
				if (idx>=copys) return null;
				else return {}
			}else{
				/* 变量模式，按数据行数打印*/
				if (idx>=data.length) return null;
				return merge_var(data[idx]);
			}
		}
		
		this.doPrint(tpdata.tpid, getVars, this.nextStep);
	}	
	
	/* 执行打印 */
	doPrint=(tpid, getVars, finish)=>{
		
		let {print_opts}=this.props;		
		let {type, name, size, col, row, copys}=print_opts;
		if (!name) {
			W.alert(_("没有该类型的打印机！"));
			return;
		}
		let opt={type, name, size, col, row}

		
		var page;
		var cancel_print=false;
	
		let w=W.show(
			<W.Dialog title={_("打印中")} height="400">
				<G.Row>
					<G.Col style={{margin:"0 auto"}}>
						<H1 >{_("正在打印第")}<span ref={e=>page=e} ></span>{_("张标签")}</H1>
						<img src="printing.jpg" alt="printing" height="260px"/>
						<p className="center"><Button type="blue" onClick={e=>cancel_print=true}>{_("取消")}</Button></p>
					</G.Col>
				</G.Row>
			</W.Dialog>
		);
						
		this.setTemplateUrl()
		window.SPIRIT.open(opt, async (p)=>{
			try {
				let i=0;
				while(true) {
					let vars=getVars(i);
					if (vars===null) break;
											
					if (page) page.innerHTML=i+1;
					await p.PrintLabel(tpid, vars);
					//await timewait();
					if (cancel_print===true) break;
					
					i++;
				}
			}catch(e){
				W.alert(''+e);
			}	
			p.close();
			w.close();
			if (finish) finish()
		});
		
	}
	
	printBySql=(sql, tpid, finish)=>{
		var page;
		var cancel_print=false;
		
		let {print_opts}=this.props;		
		let {type, name, size, col, row, copys}=print_opts;
		if (!name) {
			W.alert(_("没有该类型的打印机！"));
			return;
		}
		let opt={type, name, size, col, row}
		
	
		let w=W.show(
			<W.Dialog title={_("打印中")} height="400">
				<G.Row>
					<G.Col style={{margin:"0 auto"}}>
						<H1 >{_("正在打印第")}<span ref={e=>page=e} ></span>{_("张标签")}</H1>
						<img src="printing.jpg" alt="printing" height="260px"/>
						<p className="center"><Button type="blue" onClick={e=>cancel_print=true}>{_("取消")}</Button></p>
					</G.Col>
				</G.Row>
			</W.Dialog>
		);
		
		this.setTemplateUrl()		
		window.SPIRIT.open(opt, async (p)=>{
			await p.PrintLabelSql(tpid, sql);
			p.close();
			w.close();
			if (finish) finish()
		});	
	
	}
	
	getPrinterInfo=(name)=>{
		window.SPIRIT.getPrinterInfo(name).then(({data})=>{
			this.setState({info:data})
		}).catch(()=>{
			this.setState({spirit_ok:false})
		})
	}

	onDataChange=(values, id, val)=>{
	
		let {prnlst}=this.state;
	
		if (id==='type') {
			if (val==='ZPL') {
				values['col']='1';
				values['row']='1';
			}else{
				values['col']='auto';
				values['row']='auto';
			}
			let cur_prnlst=prnlst.filter(o=>o.type===val).map(o=>o.name)
			if (cur_prnlst.length>0) this.getPrinterInfo(cur_prnlst[0]);
			else {
				this.setState({info:null});
			}
			
			this.setState({cur_prnlst});
			this.props.onChangePrintOpts(values);
			return;
		}
		
		if (id==='name') {
			this.getPrinterInfo(val);
		}
		
		this.props.onChangePrintOpts(values);
	}
	
 	async componentDidMount () {
	 	let {print_opts}=this.props;
	 	let {type}=print_opts;
	 	
		try {
			//await loadjs("http://127.0.0.1:9011/js/spirit.js", true);
					
			let rc = await window.SPIRIT.getPrinterList();
			let prnlst=rc.data
			let cur_prnlst=prnlst.filter(o=>o.type===type).map(o=>o.name)
			if (cur_prnlst.length>0) this.getPrinterInfo(cur_prnlst[0]);
			
			this.setState({spirit_ok:true, prnlst, cur_prnlst});
			
		}catch(e){
			this.setState({spirit_ok:false});
		}
	}
	
	render() { 
	
		const fields=[
		{name:_('打印机类型'),    id:'type',  type:'select', options:{'WIN':_('Windows打印机'), 'ZPL':_('ZPL专用标签打印机')}, def:'WIN'},
		{name:_('打印机'),       id:'name',   type:'select', options:[] },
		{name:_('纸张大小'),     id:'size',   type:'select', options:{} , def:0 },
		{name:_('纸张方向'),     id:'dir',    type:'select', options:{'1':_('纵向'), '2':_('横向')}, def:'auto'},
		{name:_('每行标签列数'),  id:'col',    type:'select', options:{'auto':_('自动'), '1':1, 2:2, 3:3, 4:4, 5:5, 6:6}, def:'auto'},
		{name:_('每页标签行数'),  id:'row',    type:'select', options:{'auto':_('自动'), '1':1, 2:2, 3:3, 4:4, 5:5, 6:6}, def:'auto'},
		{name:_('打印份数'),     id:'copys',  type:'int', def:1}
	];
	
		const {tpdata}=this.props;
		const {spirit_ok, prnlst, cur_prnlst, info}=this.state;
		const {print_opts}=this.props;
		
		if (cur_prnlst.length>0) {
			if (!print_opts['name']) print_opts['name']=cur_prnlst[0];
		}else{
			print_opts['name']="";
		}
		
		let cols=[...fields];
		
		cols[1].options=cur_prnlst;
		if (info) cols[2].options=Object.keys(info.paper).reduce((a,p)=>{ a[p]=info.paper[p].name; return a}, {})
		else cols[2].options={0:_("自动")}
				
		if (tpdata.tp_vars && tpdata.tp_vars.length>0) {
			/* 有变量模板，不能打印多张 */
			var disable=['copys'];
		}

		return (
			<>
				<G.Row>
					<G.Col class="center-layout" width={'60%'}>
						{spirit_ok===false && <Error small>{_("未检测到打印控件！打印精灵未安装？")} <Button type="blue" href="https://www.printspirit.cn/download/spirit-web-setup.exe">{_("立即安装")}</Button></Error>}
						
                    <Form  fields={cols}  nCol={2} disable_fields={disable}
                                values={this.props.print_opts}
						        onChange={this.onDataChange}
						        ref={ref=>this.form=ref} />
                    </G.Col>
                </G.Row>
			
				<div class="center">
					<Button type="green" onClick={this.print}>{_("打印首张")}</Button>
					<Button type="green" onClick={this.printAll}>{_("打印全部")}</Button>
					<Button onClick={this.prevStep}>{_("上一步")}</Button>
				</div>
			</>
		);
	}
    
}

export default DoPrint
