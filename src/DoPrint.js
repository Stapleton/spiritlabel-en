import React from 'react';
import {H1} from 'ecp/page';
import G from 'ecp/grid';
import Button from 'ecp/button'
import W from 'ecp/divwin';
import Form from'ecp/form';
import {loadjs} from 'ecp/util'

const fields=[
	{name:'打印机类型',    id:'type',  type:'select', options:{'WIN':'Windows打印机', 'ZPL':'ZPL专用标签打印机'}, def:'WIN'},
	{name:'打印机',       id:'name',  type:'select', options:["缺省"] },
	{name:'纸张大小',     id:'size',  type:'select', options:{'A4':'A4', 'B5':'B5', 'auto':'自动'}, def:'auto'},
	{name:'纸张方向',     id:'dir',  type:'select', options:{'1':'纵向', '2':'横向'}, def:'auto'},
	{name:'每行标签列数',  id:'col',   type:'select', options:{'auto':'自动', '1':1, 2:2, 3:3, 4:4, 5:5, 6:6}, def:'auto'},
	{name:'每页标签行数',  id:'row',   type:'select', options:{'auto':'自动', '1':1, 2:2, 3:3, 4:4, 5:5, 6:6}, def:'auto'},
];

// 将独立的ns1.ns2...key1变量按ns组合起来：
// 如：{ns1.key1:v1, ns1.key2:v2} => {ns1:{key1:v1, key2:v2}}
function merge_var(row) {
	let r={}
	let keys=Object.keys(row);
	keys.forEach((varname)=>{
		let ns = varname.split('.');
		let vp = r;
		for (let i=1;i< ns.length - 1; i++) {
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
		let {print_opts}=this.state;
		
		let {type, col, row}=print_opts;
		let opts={type, col, row}
		var getVars=(idx)=>{
			if (idx>0) return null;
			if (tpdata.tp_vars.length===0) {
				return {}
			}else{
				return merge_var(data[0]);
			}
		}
		
		this.doPrint(opts, tpdata.tpid, getVars);
	}
		
	printAll=()=>{
		let {tpdata, data}=this.props;
		let {print_opts}=this.state;
		if (data.length===0) return;
		
		let {type, col, row, copys}=print_opts;
		let opts={type, col, row}
		
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
		
		this.doPrint(opts, tpdata.tpid, getVars, this.nextStep);
	}	
	
	/* 执行打印 */
	doPrint=(opt, tpid, getVars, finish)=>{
		loadjs("http://127.0.0.1:9011/js/spirit.js", true).then(()=>{		
			
			var page;
			var cancel_print=false;
		
			let w=W.show(
				<W.Dialog title="打印中" height="400">
					<G.Row>
						<G.Col style={{margin:"0 auto"}}>
							<H1 >正在打印第<span ref={e=>page=e} ></span>张标签</H1>
							<img src="printing.jpg" alt="printing" height="260px"/>
							<p className="center"><Button type="blue" onClick={e=>cancel_print=true}>取消</Button></p>
						</G.Col>
					</G.Row>
				</W.Dialog>
			);
						
			window.SPIRIT.open(opt, async (p)=>{
				try {
					let i=0;
					while(true) {
						let vars=getVars(i);
						if (vars===null) break;
						console.log(vars);
						
						if (page) page.innerHTML=i+1;
						await p.PrintLabel(tpid, vars);
						//await timewait();
						if (cancel_print===true) break;
						
						i++;
					}
				}catch(e){
					W.alert(e);
				}	
				p.close();
				w.close();
				if (finish) finish()
			});
			
		}).catch(()=>{
			if (!window.confirm('未安装打印控件，立即安装吗?')) return;
			window.location.href='/download/spirit-web-setup.exe';
		});
	}

	onDataChange=(values, id, val)=>{
		if (id==='type') {
			if (val==='ZPL') {
				values['col']='1';
				values['row']='1';
			}else{
				values['col']='auto';
				values['row']='auto';
			}
		}
		this.setState({print_opts:values});
	}
	
	render() { 
		const {tpdata}=this.props;
		let cols=[...fields]
		if (!tpdata.tp_vars || tpdata.tp_vars.length===0) {
			/* 无变量模板， 批量打印多张 */
			cols.push({name:'打印份数', id:'copys',   type:'int', def:1})
		}
	
		return (
			<>
				<G.Row>
					<G.Col class="center-layout" width={'60%'}>
						<Form  fields={cols}  nCol={2} 
               values={this.state.print_opts}
               onChange={this.onDataChange}
               ref={ref=>this.form=ref} />
          </G.Col>
        </G.Row>
			
				<div class="center">
					<Button type="green" onClick={this.print}>打印首张</Button>
					<Button type="green" onClick={this.printAll}>打印全部</Button>
					<Button onClick={this.prevStep}>上一步</Button>
				</div>
			</>
		);
	}
    
}

export default DoPrint
