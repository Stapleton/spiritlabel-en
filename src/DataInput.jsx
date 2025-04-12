import React from 'react';
import {Table, Button, ConfirmButton, DivWin as W, Toolbar, Form} from 'ecp';
import {saveAs} from 'file-saver';
import {classNames} from 'ecp';
import "./iconfont.css"
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

class FileBtn extends React.Component {
	handleChange=(e)=> {
		const files = e.target.files;
		if(files && files[0]) this.props.handlefile(files[0]);
		this.fileSelector.value='' /* must set it, or it maynot triger other file select for same file */
	};
	
	onRef=e=>{
		this.fileSelector=e;
	}
	
	select=()=>{
		import("xlsx"); /* 等待用户选文件时完成预先加载*/
		this.fileSelector.click();
	}
	
	render() {
		const {children, ...others} = this.props;
		return (
			<Button {...others} onClick={this.select} >
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
		<span className="execel-header">{bind_vars[col]} <button onClick={select_var}>{_("修改")}</button></span> :
		<span className="execel-header err">{_("未用")}<button onClick={select_var}>{_("点击绑定变量")}</button></span>
	)
}

class DBConn extends React.Component {
    state={
        sql_list : [],
        sql_idx  : -1,
        sql_cfg : this.props.sql_conf || {}
    }
	
	componentDidMount=async ()=>{
		let {data} = await window.SPIRIT.DBQueryList();
    	this.setState({sql_list:data})
    }
    
    onDataChange=(values, id, val)=>{
        this.setState({sql_cfg:values})
	}
	
	setSql=async ()=>{
	    if (!window.SPIRIT) {
	        W.alert(_("请先安装打印插件"));
   		    return;
	    }
        let {sql_cfg}=this.state
        let {vars_map, ...sql_cfg1}=sql_cfg
	    let rc = await window.SPIRIT.DBQuery(sql_cfg1);
		if (rc.rc==='MSG') {
			W.alert(rc.msg);
			return;
		}
				
		rc=await this.props.setSqlData(rc.data, sql_cfg)
		if (rc) {
		    this.props.dialog.close();
		}
	}
	
	close=()=>{
	    this.props.dialog.close();
	}
	
	sel=i=>()=>{
		const sql_cfg=this.state.sql_list[i];
		this.setState({sql_cfg, sql_idx:i})
	}
	
	newSql=()=>{
		const sql_cfg={type:"mysql"}
		this.setState({sql_cfg, sql_idx:-1})
	}
	
	del=async()=>{
        const {sql_cfg, sql_list, sql_idx}=this.state;
        if (sql_idx!==-1) {
            sql_list.splice(sql_idx, 1)
            this.setState({sql_list, sql_idx:-1});
			await window.SPIRIT.DBSaveQuery(sql_list);
        }
    }
	
	saveSql=async()=>{
		let {sql_cfg, sql_list, sql_idx}=this.state;
		if (!sql_cfg.name) {
		    W.alert(_("请输入数据库连接名称"));
		    return;
		}
		let { vars_map, ...sql_cfg1} = sql_cfg
		if (sql_idx===-1) {
		    sql_list=[ ...sql_list, sql_cfg1]
			this.setState({ sql_list , sql_idx: sql_list.length})
		}else{
			sql_list[sql_idx]=sql_cfg1;
			this.setState({sql_list});
		}
        await window.SPIRIT.DBSaveQuery(sql_list);
    }
    
    render() {
    
        let db_cfg=[
            {name:_('连接名'),     id:'name'},
	        {name:_('数据库类型'), id:'type',  type:'select', require:true, def:'mysql',
	            options:{'sqlite':'SQLite', 'mssql':'MS-SQL', 'mysql':'MYSQL', 'pgsql':'PostgresSQL'}},
	        {name:_('IP地址'),     id:'ip'},
	        {name:_('端口'),       id:'port'},
	        {name:_('用户名'),     id:'user'},
	        {name:_('密码'),       id:'pass', type:'password'},
	        {name:_('数据库名'),   id:'dbname', def:'default'},
	        {name:_('附加参数'),   id:'opt'},
	        {name:_('SQL'),        id:'sql',  type:'text',  colspan:2, 
	                style:{height:225, width:490, border:'1px solid #adadad', resize:'none', borderRaduis:'2px'}},
        ];
    
		const {sql_list, sql_idx, sql_cfg}=this.state;
		const {dialog} = this.props;
		dialog.form=this;
		
		let disable_fields=[]
		if (sql_cfg['type']==='sqlite') {
            disable_fields=['ip', 'port', 'user', 'pass']
            db_cfg[8].style={...db_cfg[8].style, height:309};
        }else{
            db_cfg[8].style={...db_cfg[8].style, height:225};
        }        
        return (
            <div  className="sql-conn-panel">
                <div className="left">
				    { sql_list.length===0 ?
					    <div>
						    <div className="center mt10">{_("可以通过数据库连接本地系统，如ERP, WMS等系统")}</div>
					    </div>:
					    <div>
							<ul className="sql-list">
							{sql_list.map((o,i)=><li key={i} 
							    onClick={this.sel(i)} 
							    className={classNames({'active':i===sql_idx})}>{o.name}</li>)}
							</ul>
						</div>
				    }
				    <div className="center new_sql">
					    <Button type="green" onClick={this.newSql}>{_("新增")}</Button>
				    </div>
                </div>
                <div className="right">
                    <div style={{height:440}}>
                        <Form  fields={db_cfg}  nCol={2} disable_fields={disable_fields}
                           values={sql_cfg}
					       onChange={this.onDataChange}
					       ref={ref=>dialog.gform=ref} />
					</div>
	                 <Toolbar>
                        <Button onClick={this.saveSql}>{_("保存")}</Button>
    					{sql_idx>=0 && <ConfirmButton msg={_("删除本条记录吗?")} onClick={this.del}>{_("删除")}</ConfirmButton>}
	                    <Toolbar.Ext>
                		    <Button type="green" onClick={this.setSql}>{_("确定")}</Button>
                		    <Button onClick={this.close}>{_("关闭")}</Button>
                		    <Button href="/doc/label_print.md#use_db" target="_blank">{_("使用说明")}</Button>
            		    </Toolbar.Ext>
            		 </Toolbar>
                </div>
            </div>
        )
    }
}

class DataInput extends React.Component {
	/* 状态 */
	state={
		xls       : false,       /* is load from xls       */
		data      : [],          /* xls data               */
		cols      : [],          /* xls col                */
		bind_vars : {},          /* xls key map to tp_vars */
		total     : 0,           /* total row of db        */
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
		let {xls, bind_vars, total}=this.state;
		let {sql, tpdata}=this.props;
		let data=this.table.getData()
		
		var data1=[]
		if (xls || sql) {
			let vars=Object.values(bind_vars);
			for(let i=0; i<tpdata.tp_vars.filter(o=>!o.startsWith("spirit.")).length; i++) {
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
		if (sql) {
		    sql.vars_map={}
		    for (let k in bind_vars) {
		        if (k!==bind_vars[k]) sql.vars_map[k]=bind_vars[k]
		    }
			this.props.onSetSql(sql, data1, total)
		}else{
			this.props.onDataChange(data1);
		}
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
				const wb = XLSX.read(bstr, {type:rABS ? 'binary' : 'array', codepage: 65001});
				
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
				if (Object.keys(bind_vars).length===tp_vars.filter(o=>!o.startsWith("spirit.")).length || Object.keys(bind_vars).length>3) {
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
		this.props.onSetSql(null, data);
	}
	
	do_db_conn=(form, sqlcfg)=>{
	    form.close();
    }
	
	setSqlData=async ({columns, total, data}, sql_cfg)=>{
		let {tp_vars}=this.props.tpdata;
		
		if (columns.length<tp_vars.filter(o=>!o.startsWith("spirit.")).length) {
			W.alert(_("数据查询结果不正确"))
			return;
		}			
		
		let bind_vars={};
		if (sql_cfg.vars_map) {
			bind_vars=sql_cfg.vars_map
		}else{
				
			for (let i=0; i<tp_vars.filter(o=>!o.startsWith("spirit.")).length; i++) {
				let item=tp_vars[i]
				if (!columns.includes(item)) {
					let yn = await W.confirm(_("数据字段与标签不吻合"))
					if (yn===false) return false;
					break;
				}
			}
			
			for(let c of columns) {
				if (tp_vars.indexOf(c)>=0) {
					bind_vars[c]=c;
				}
			}
		}
		
		this.props.onSetSql(sql_cfg, data)
		this.setState({xls:false, bind_vars, cols:columns, data, total})
		return true;
	}
	
	db_conn=()=>{
	    if (typeof window.SPIRIT.DBQueryList !== "function") {
	        W.alert(
	            <>
	                <div>{_("打印插件版本太低,需要升级")}</div>
	                <div><a href="/download/spirit-web-setup.exe">立即下载安装</a></div>
	            </>)
	        return;
	    }
	    W.show(
			<W.Dialog
			    title={_("连接数据库")} 
			    width="800" height="500" btn_CANCEL 
			    onSubmit={this.do_db_conn}
			>
			    <DBConn setSqlData={this.setSqlData} sql_conf={this.props.sql} />
			</W.Dialog>
		); 
	}

	render() {
		let {tpdata, sql}=this.props;
		let {xls, cols, bind_vars, total}=this.state;
		
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
		}else if(sql) {
			columns=cols.map((o,i)=>{ return {
				title:<ExcelHeader 
					col={o} bind_vars={bind_vars} tp_vars={tpdata.tp_vars}
					onBindVar={this.onBindVar}
				/>, 
				key:o}
			})
			data=this.state.data;
		}else{	
			columns=tpdata.tp_vars?tpdata
				.tp_vars.filter(o=>!o.startsWith("spirit."))
				.map(o=>{ return {title:o, key:o} }):[]
			data = this.props.data||[];			
		}
		
		return (
			<>
			 	<Toolbar style={{borderBottom:'1px solid #ccc'}}>
					{ sql ? 
					<Toolbar.Group>
					    <Button icon='database' icon_group='app' color='blue' type="blue" onClick={this.db_conn} >{_("重连")}</Button>
					    <span>{_("共有")+total+_("条记录")}</span>
					</Toolbar.Group>
					:  
					<Toolbar.Group>
					    <FileBtn icon='Excel' icon_group='app' type="blue" handlefile={this.handleFile}>{_("导入数据文件")}</FileBtn>
					    <Button icon='database' icon_group='app' color='blue' type="blue" onClick={this.db_conn} >{_("连接数据库")}</Button>
					</Toolbar.Group>}
				
					<Toolbar.Group>
						{!sql && <Button onClick={this.addRow}>{_("增加行")}</Button>}
						{xls && <Button onClick={this.addCol}>{_("增加列")}</Button>}
					</Toolbar.Group>
				
					<Toolbar.Ext>
						<Toolbar.Group>
							<Button onClick={this.clearData}>{_("清除数据")}</Button>
							<Button onClick={this.export} >{_("导出数据模板")}</Button>
						</Toolbar.Group>
					</Toolbar.Ext>
				</Toolbar>
			 	
			 	<Table className="data-input" edit
			 		data={data} columns={columns} actions={this.actions} pg_size={10} ref={t=>this.table=t}/>
				<div style={{float:"right"}}>
					<Button onClick={this.prevStep}>{_("上一步")}</Button>
					<Button type="green" onClick={this.nextStep}>{_("下一步")}</Button>
				</div>
			</>
		);
	}

}

export default DataInput
