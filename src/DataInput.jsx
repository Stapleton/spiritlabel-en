import React from 'react';
import {Table, Button, ConfirmButton, DivWin as W, Toolbar} from 'ecp';
import {saveAs} from 'file-saver';
import {_} from "./locale.js";

/* list of supported file types */
const SheetJSFT = [
	"xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(function(x) { return "." + x; }).join(",");

/*
  Simple HTML5 file drag-and-drop wrapper
  usage: <DragDropFile handleFile={handleFile}>...</DragDropFile>
    handleFile(file:File):void;
*/
/*class DragDropFile extends React.Component {
	constructor(props) {
		super(props);
		this.onDrop = this.onDrop.bind(this);
	};
	suppress(evt) { evt.stopPropagation(); evt.preventDefault(); };
	onDrop(evt) { evt.stopPropagation(); evt.preventDefault();
		const files = evt.dataTransfer.files;
		if(files && files[0]) this.props.handleFile(files[0]);
	};
	render() { return (
		<div onDrop={this.onDrop} onDragEnter={this.suppress} onDragOver={this.suppress}>
			{this.props.children}
		</div>
	); };
};*/

/*
  Simple HTML5 file input wrapper
  usage: <DataInput handleFile={callback} />
    handleFile(file:File):void;
*/
class FileBtn extends React.Component {
	handleChange=(e)=> {
		const files = e.target.files;
		if(files && files[0]) this.props.handleFile(files[0]);
	};
	
	onRef=e=>{
		this.fileSelector=e;
	}
	
	select=()=>{
		import("xlsx"); /* 等待用户选文件时完成预先加载*/
		this.fileSelector.click();
	}
	
	render() {
		const {children, type} = this.props;
		return (
			<Button type={type} onClick={this.select} >
				<input type="file" style={{display:"none"}} accept={SheetJSFT} onChange={this.handleChange} ref={this.onRef}/>
				{children}
			</Button>
		);
	}
}

function ExcelHeader(props) {

	let {col, bind_vars, tp_vars}=props;
	let cur_var= col in bind_vars ? bind_vars[col] : tp_vars[0]
	
	var do_bind=(form, {cur_var})=>{	
		props.onBindVar(col, cur_var);
		form.close();
	}
	
	var select_var=function() {
		let f=[{name:_("将当前列绑定到："), id:"cur_var", type:"select", options:tp_vars}]
		W.show(
			<W.Form title={_('选择变量')} onSubmit={do_bind} height={200} fields={f} defaultValues={{cur_var}}/>
		)		
	}
		
	return (col in bind_vars ? 
		<span class="execel-header">{bind_vars[col]} <a href="#" onClick={select_var}>{_("修改")}</a></span> :
		<span class="execel-header err">{_("未用")}<a href='#' onClick={select_var}>{_("点击绑定变量")}</a></span>
	)
}

class DataInput extends React.Component {
	/* 状态 */
	state={
		xls       : false,       /* is load from xls       */
		data      : [],          /* xls data               */
		cols      : [],          /* xls col                */
		bind_vars : {}           /* xls key map to tp_vars */
	}

	constructor(props) {
		super(props);
		let {tpid, tp_vars}=props.tpdata;
		if (!tpid || tp_vars.length===0 ) this.props.history.push("/print-tools/seltp")
		else this.props.setStep("loaddata")
	}

	actions=(tabObj, record)=>{
		return(
			<div style={{width:120}}>
				<Button type='inline' onClick={()=>tabObj.insert(record)}>{_("插入")}</Button>
				<ConfirmButton type='danger' onClick={()=>tabObj.del(record)}>{_("删除")}</ConfirmButton>
			</div>
		)
	}

	prevStep=()=>{
		this.props.history.push("/print-tools/seltp")
	}

	nextStep=()=>{
		let {xls, bind_vars}=this.state;
		let {tpdata}=this.props;
		let data=this.table.getData()
		
		var data1=[]
		if (xls) {
			let vars=Object.values(bind_vars);
			for(let i=0; i<tpdata.tp_vars.length; i++) {
				let v=tpdata.tp_vars[i];
				if (vars.indexOf(v)<0) {
					W.alert(_("变量")+v+_("未绑定_alert"));
					return;
				}
			}
			
			data.forEach(d=>{
			
				if (d.length===1) return; /* only _key : is blank */
				
				var d1={};
				for( let col in bind_vars ) {
					let varname=bind_vars[col];
					d1[varname]=String(d[col] ||"");
				}
				
				data1.push(d1);				
			})
			
		}else{
			data.forEach(d=>{
				if (Object.keys(d).length===1) return; /* only _key : is blank */
				delete(d._key);
				data1.push(d);		
			})
		}
		
		if (data1.length===0) {
			W.alert(_("数据不能为空"));
			return;
		}
		
		this.props.onDataChange(data1);
		this.props.history.push("/print-tools/doprint")
	}
	
	onBindVar=(col, v)=>{
		let {bind_vars}=this.state;
		
		for(var key in bind_vars ){
			if (bind_vars[key]===v) delete bind_vars[key];
		}
		bind_vars[col]=v;
	
		this.setState({bind_vars});
	}
	
	handleFile=(file/*:File*/)=>{
		/* Boilerplate to set up FileReader */
		const reader = new FileReader();
		const rABS = !!reader.readAsBinaryString;

		reader.onload = (e) => {
		
			import('xlsx').then(module => {
				var XLSX = module;
				
				/* for execel header */
				const make_excel_cols = refstr => {
					let o = [], range = XLSX.utils.decode_range(refstr);
					let S=range.s.c , E=range.e.c + 1;
					for(var i = 0; i < E - S; ++i) o[i] = XLSX.utils.encode_col(i);
					return o;
				};
				
				/* Parse data */
				const bstr = e.target.result;
				const wb = XLSX.read(bstr, {type:rABS ? 'binary' : 'array'});
				/* Get first worksheet */
				const wsname = wb.SheetNames[0];
				const ws = wb.Sheets[wsname];
				/* Convert array of arrays */
				let data = XLSX.utils.sheet_to_json(ws, {header:1});
				
				if (data.length===0) {
					W.alert(_("没有数据"));
					return;		
				}
				
				const {tp_vars}=this.props.tpdata;
				let header=data[0];
				let bind_vars={};
				for(let i=0; i<header.length; i++) {
					if (tp_vars.indexOf(header[i])>=0) {
						bind_vars[i]=header[i];
					}
				}
				if (Object.keys(bind_vars).length===tp_vars.length || Object.keys(bind_vars).length>3) {
					/* 认为第一行为表头，而不是数据*/
					delete data[0]
				}else{
					bind_vars={}
				}
				
				/* Update state */
				this.setState({xls:true, bind_vars, data, cols: make_excel_cols(ws['!ref'])});
			})
		};
		if(rABS) reader.readAsBinaryString(file); 
		else reader.readAsArrayBuffer(file);
	};
	
	export=()=>{
		let {tpdata}=this.props;
		let {tp_vars, tpinfo}=tpdata;
		let content=tp_vars.join(",");
		//let uriContent = "data:application/octet-stream," + encodeURIComponent(content);
		//window.open(uriContent, `${tpinfo.name}-data.csv`);
		var blob = new Blob([content], {type: "application/octet-stream;charset=utf-8"});
		saveAs(blob, `${tpinfo.name}-data.csv`);
	}
	
	addRow=()=>{
	  this.table.append();
	}
	
	addCol=()=>{
		
		let {xls, cols, bind_vars}=this.state;
		if (!xls) return;
		
		let {tp_vars}=this.props.tpdata;
		let used_vars=Object.values(bind_vars);
		let left_vars=tp_vars.filter(x=>used_vars.indexOf(x)<0)
		
		if (left_vars.length===0) {
			W.alert(_("没有需要绑定的变量"));
			return;
		}
		let cur_var = left_vars[0]
		
		var do_bind=(form, {cur_var})=>{	
			form.close();
			let col=cols.length;
			cols.push(col);
			bind_vars[col]=cur_var;
			this.setState({cols});
		}
			
		let f=[{name:_("数据列绑定变量："), id:"cur_var", type:"select", options:left_vars}]
		W.show(
			<W.Form title={_('增加数据列')} onSubmit={do_bind} height={200} defaultValues={{cur_var}} fields={f} />
		);
	}
	
	clearData=()=>{
		this.setState({xls:false});
		let data=[]
		for(let i=0; i<10; i++) data.push({});
		this.props.onDataChange(data);
	}

	render() {
		let {tpdata}=this.props;
		let {xls, cols, bind_vars}=this.state;
		
		let columns=[];
		let data=[];
		if (xls) {
			columns=cols.map((o,i)=>{ return {
				title:<ExcelHeader 
					col={i} bind_vars={bind_vars} tp_vars={tpdata.tp_vars}
					onBindVar={this.onBindVar}
				/>, 
				key:i}
			})
			data=this.state.data;
		}else {
			columns=tpdata.tp_vars?tpdata.tp_vars.map(o=>{ return {title:o, key:o} }):[]
			data = this.props.data||[];
		}
		
		return (
			<>
			 	<Toolbar style={{borderBottom:'1px solid #ccc'}}>
					<Toolbar.Group>
						<FileBtn type="green" handleFile={this.handleFile}>{_("导入数据文件")}</FileBtn>
					<Button onClick={this.export} >{_("导出数据模板")}</Button>
					</Toolbar.Group>
				
					<Toolbar.Group>
						<Button onClick={this.addRow}>{_("增加行")}</Button>
						{xls && <Button onClick={this.addCol}>{_("增加列")}</Button>}
					</Toolbar.Group>
				
					<Toolbar.Ext>
						<Toolbar.Group>
							<Button onClick={this.clearData}>{_("清除数据")}</Button>
						</Toolbar.Group>
					</Toolbar.Ext>
				</Toolbar>
			 	
			 	<Table className="data-input" edit 
			 		data={data} columns={columns} actions={this.actions} pg_size={10} ref={t=>this.table=t}/>
				{<div style={{float:"right"}}>
					<Button onClick={this.prevStep}>{_("上一步")}</Button>
					<Button type="green" onClick={this.nextStep}>{_("下一步")}</Button>
				</div>}
			</>
		);
	}

}

export default DataInput
