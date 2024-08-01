import React from 'react';
import {loadjs} from './gaf/utils.js';
import './objshare.css';

const type_P=0;
const type_O=1;
const type_G=2;

/**
 * 设置共享权限
 */
class ObjShare extends React.PureComponent {
	
	onSel(type, Robj, nids, nnames) {
		const val=[...this.props.acl];
		val[type]={ids:nids, names:nnames};
		this.props.onChange(val);
	}

	selPerson=(e)=>{
		e.preventDefault();
		
		var config={
			callback: this.onSel.bind(this, type_P)
			,title  :'选择员工'
			,rootname : this.props.orgRoot || '组织机构'
			,showPerson : 'Y'
			,filter : ['P']
		}	
		
		const [P,O,G]= this.props.acl;
		config.IdList=P?(P.ids||[]):[];
		config.NameList=P?(P.names||[]):[];
		var os=new orgselector(config);
	}
	
	selOrg=()=>{
		var config={
			callback: this.onSel.bind(this, type_O)
			,title:'选择机构'
			,rootname:this.props.orgRoot || '组织机构'
			,orgid: this.props.orgid || 1
			,orgname: this.props.orgname || ''
			,showPerson:'N'
			,showWG:'N'
			,filter:['O']
		}	
		
		const [P,O,G]= this.props.acl;
		config.IdList=O?(O.ids||[]):[];
		config.NameList=O?(O.names||[]):[];
		var os=new orgselector(config);
	}
	
	selWorkgroup=()=>{
		var config={
			callback: this.onSel.bind(this, type_G)
			,title:'选择工作组'
			,showPerson:'N'
			,showWG:'Y'
			,showOrg:'N'
			,rootname:this.props.orgRoot || '组织机构'
			,filter:['G']
		}
		
		const [P,O,G]= this.props.acl;
		config.IdList=G?(G.ids||[]):[];
		config.NameList=G?(G.names||[]):[];
		var os=new orgselector(config);
	}
	
	componentDidMount=()=>{
		loadjs('/js/org/orgselector.js');
	}
	
	render() {
		const [P,O,G]= this.props.acl;
		return (
			<table className="obj-share">
				<tbody>
					<tr>
						<th className="OSleft">
							<span className="title"><a onClick={this.selPerson} title="点击修改">员工</a></span>
							<a className="btn_setting" onClick={this.selPerson} title="点击修改"></a>
						</th>
		
						<th className="OSmiddle">
							<span className="title"><a onClick={this.selOrg} title="点击修改">部门</a></span>
							<a className="btn_setting" onClick={this.selOrg} title="点击修改" ></a>
						</th>
		
						<th className="OSright">
							<span className="title"><a onClick={this.selWorkgroup} title="点击修改">工作组</a></span>
							<a className="btn_setting" onClick={this.selWorkgroup} title="点击修改"></a>
						</th>
					</tr>
					<tr>
						<td>
							<div className="OSleft">
								<ul>{P && P.names && P.names.map((n,i)=><li key={i}>{n}</li>)}</ul>
							</div>
						</td>
						<td>
							<div className="OSleft">
								<ul>{O && O.names && O.names.map((n,i)=><li key={i}>{n}</li>)}</ul>
							</div>
						</td>
						<td>
							<div className="OSleft">
								<ul>{G && G.names && G.names.map((n,i)=><li key={i}>{n}</li>)}</ul>
							</div>
						</td>
					</tr>
				</tbody>	
			</table>
		);
	}
}

export default ObjShare; 
