import React from 'react';
import Table from 'ecp/table';
import {Page, H1, H2, H3} from 'ecp/page';
import Button from 'ecp/button'
import ConfirmButton from 'ecp/confirm_button'
import W from 'ecp/divwin';
import XLSX from 'xlsx'

/* list of supported file types */
const SheetJSFT = [
	"xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(function(x) { return "." + x; }).join(",");

/* generate an array of column objects */
const make_cols = refstr => {
	let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
	for(var i = 0; i < C; ++i) o[i] = {title:XLSX.utils.encode_col(i), key:i}
	return o;
};

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


class DataInput extends React.Component {
    /* 状态 */
    state={
        data:[],
    }
    
    constructor(props) {
       super(props);
       this.props.setStep("loaddata")
    }
    
    componentDidMount=()=>{
    }
    
    componentWillUnmount() {
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
    	let data=this.table.getData()
    	if (data.length===0) {
    		W.alert("数据不能为空");
    	}
    	this.props.onDataChange(data);
    	this.props.history.push("/print-tools/doprint")
    }
    
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
		this.props.onDataChange(data, make_cols(ws['!ref']));
	};
	if(rABS) reader.readAsBinaryString(file); 
	else reader.readAsArrayBuffer(file);
    };
    
    selfile=()=>{
    	this.fileSelector.select();
    }
    
    switch_input_data=()=>{
    	this.props.onDataChange([{},{}], [{title:"1", key:"name"}, {title:"2", key:"addr"}])
    }
    
    render() { 
        let {data, columns}=this.props;
    	return (
    	   <>
    	   	<div class="upload-area">
	    	   	<FileInput ref={e=>this.fileSelector=e} handleFile={this.handleFile}/>
    	   		<Button large type="green" onClick={this.selfile}>选择数据文件</Button>
    	   		<p>支持：excel, cvs 等格式</p>
    	   	</div>
    	   	{ columns && columns.length!==0 ?
	    	   	<>
	    	   		<Table edit data={data} columns={columns} actions={this.actions} pg_size={10} ref={t=>this.table=t}/>
		    	   	<div style={{float:"right"}}>
					<Button onClick={this.prevStep}>上一步</Button>
			    	   	<Button onClick={this.nextStep}>下一步</Button>
			    	</div>
		        </>
		        :
		        <div class="upload-area">
		        	<div style={{height:20}}/>
		        	<Button large type="green" onClick={this.switch_input_data}>手工输入数据</Button>
		        </div>
		 }
	   </>
    	);
    }

}

export default DataInput
