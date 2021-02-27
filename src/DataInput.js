import React from 'react';
import Table from 'ecp/table';
import Button from 'ecp/button'
import ConfirmButton from 'ecp/confirm_button'
import W from 'ecp/divwin';
import XLSX from 'xlsx'

/* list of supported file types */
const SheetJSFT = [
	"xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(function(x) { return "." + x; }).join(",");

/*
  Simple HTML5 file drag-and-drop wrapper
  usage: <DragDropFile handleFile={handleFile}>...</DragDropFile>
    handleFile(file:File):void;
*/
class DragDropFile extends React.Component {
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
};

/*
  Simple HTML5 file input wrapper
  usage: <DataInput handleFile={callback} />
    handleFile(file:File):void;
*/
class FileInput extends React.Component {
	handleChange=(e)=> {
		const files = e.target.files;
		if(files && files[0]) this.props.handleFile(files[0]);
	};
	
	onRef=e=>{
		this.fileSelector=e;
	}
	
	select=()=>{
		this.fileSelector.click();
	}
	
	render() { return (
		<input type="file" style={{display:"none"}} accept={SheetJSFT} onChange={this.handleChange} ref={this.onRef}/>
	); };
}

function ExcelHeader(props) {

	let {col, bind_vars, tp_vars}=props;
	let cur_var= col in bind_vars ? bind_vars[col] : tp_vars[0]
		
	var sel_var=function(e) {
			cur_var=e.target.value;
	}
	
	var do_bind=(form)=>{	
		props.onBindVar(col, cur_var);
		form.close();
	}
	
	var select_var=function() {
		W.show(
			<W.Form title='选择变量' onSubmit={do_bind}>
				<select onChange={sel_var} defaultValue={cur_var}>
					{tp_vars.map((o,i)=><option key={i} >{o}</option>)}
				</select>
			</W.Form>
		)		
	}
		
	return (col in bind_vars ? 
		<span class="execl-header">{bind_vars[col]} <a href="#" onClick={select_var}>修改</a></span> :
		<span class="execl-header"><a href='#' onClick={select_var}>点击绑定变量</a></span>
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
		this.props.setStep("loaddata")
	}

	actions=(tabObj, record)=>{
		return(
			<span>
				<Button type='inline' onClick={()=>tabObj.insert(record)}>插入</Button>
				<ConfirmButton type='danger' onClick={()=>tabObj.del(record)}>删除</ConfirmButton>
			</span>
		)
	}

	prevStep=()=>{
		this.props.history.push("/print-tools/seltp")
	}

	nextStep=()=>{
		let {xls, cols, bind_vars}=this.state;
		let {tpdata}=this.props;
		let data=this.table.getData()
		
		var data1=[]
		if (xls) {
			let vars=Object.values(bind_vars);
			for(let i=0; i<tpdata.tp_vars.length; i++) {
				let v=tpdata.tp_vars[i];
				if (vars.indexOf(v)<0) {
					W.alert(`变量${v}未绑定`);
					return;
				}
			}
			
			data.forEach(d=>{
			
				if (d.length===1) return; /* only _key : is blank */
				
				var d1={};
				for( let col in bind_vars ) {
					let varname=bind_vars[col];
					d1[varname]=d[col];
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
			W.alert("数据不能为空");
		}
		
		console.log(data1);
		
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
	
	/* for execel header */
	make_excel_cols = refstr => {
		let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
		for(var i = 0; i < C; ++i) o[i] = XLSX.utils.encode_col(i);
		return o;
	};

	handleFile=(file/*:File*/)=>{
	/* Boilerplate to set up FileReader */
		const reader = new FileReader();
		const rABS = !!reader.readAsBinaryString;

		reader.onload = (e) => {
			/* Parse data */
			const bstr = e.target.result;
			const wb = XLSX.read(bstr, {type:rABS ? 'binary' : 'array'});
			/* Get first worksheet */
			const wsname = wb.SheetNames[0];
			const ws = wb.Sheets[wsname];
			/* Convert array of arrays */
			const data = XLSX.utils.sheet_to_json(ws, {header:1});
			/* Update state */
			this.setState({xls:true, bind_vars:{}, data, cols: this.make_excel_cols(ws['!ref'])});
		};
		if(rABS) reader.readAsBinaryString(file); 
		else reader.readAsArrayBuffer(file);

	};

	selfile=()=>{
		this.fileSelector.select();
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
			columns=tpdata.tp_vars.map(o=>{ return {title:o, key:o} })
			data = this.props.data;
		}
		
		return (
			<>
			 	<div class="upload-area">
			   	<FileInput ref={e=>this.fileSelector=e} handleFile={this.handleFile}/>
			 		<Button large type="green" onClick={this.selfile}>选择数据文件</Button>
			 		<p>支持：excel, cvs 等格式</p>
			 	</div>
			 	<Table edit data={data} columns={columns} actions={this.actions} pg_size={10} ref={t=>this.table=t}/>
				<div style={{float:"right"}}>
					<Button onClick={this.prevStep}>上一步</Button>
					<Button onClick={this.nextStep}>下一步</Button>
				</div>
			</>
		);
	}

}

export default DataInput
