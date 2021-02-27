import React from 'react';
import Table from 'ecp/table';
import {Page, H1, H2, H3} from 'ecp/page';
import Button from 'ecp/button'
import ConfirmButton from 'ecp/confirm_button'
import W from 'ecp/divwin';
import {loadjs} from 'ecp/util'

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

	componentDidMount=()=>{
		this.props.setStep("doprint")
	}

	nextStep=()=>{
		this.props.history.push("/print-tools/finish");
	}
	
	prevStep=()=>{
		this.props.history.push("/print-tools/loaddata")
	}
		
	print=()=>{
		let {tpdata, data}=this.props;
		if (data.length==0) return;
		let vars=merge_var(data[0]);
		
		loadjs("http://127.0.0.1:9011/js/spirit.js", true).then(()=>{
			let w=W.show(<W.Form title="打印中"/>);  
			window.SPIRIT.open({}, async (p)=>{
				try {
					await p.PrintLabel(tpdata.id, vars);
					p.close();
				}catch(e){
					W.alert(e);
				}
				w.close();
			});
		}).catch(()=>{
			if (!window.confirm('未安装打印控件，立即安装吗?')) return;
			window.location.href='/download/spirit-web-setup.exe';
		});
	}
	
	printAll=()=>{
		let {tpdata, data}=this.props;
		if (data.length==0) return;

		loadjs("http://127.0.0.1:9011/js/spirit.js", true).then(()=>{		
			let w=W.show(<W.Form title="打印中"/>);  
			window.SPIRIT.open({}, async (p)=>{
				try {
					for(let i=0; i<data.length; i++) {
						let vars=merge_var(data[i]);
						await p.PrintLabel(tpdata.id, vars);
					}
				}catch(e){
					W.alert(e);
				}	
				p.close();
				w.close();
			});
			
		}).catch(()=>{
			if (!window.confirm('未安装打印控件，立即安装吗?')) return;
			window.location.href='/download/spirit-web-setup.exe';
		});
	}

	render() { 
		return (
			<>
				<div class="upload-area">
					<Button type="green" onClick={this.print}>打印首张</Button>
					<Button type="green" onClick={this.printAll}>打印全部</Button>
					<Button onClick={this.prevStep}>上一步</Button>
				</div>
			</>
		);
	}
    
}

export default DoPrint
