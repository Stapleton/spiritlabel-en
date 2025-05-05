import React, { useState, useRef, useEffect, useCallback } from "react";
import { Spreadsheet, Worksheet, jspreadsheet } from "@jspreadsheet-ce/react";
import { Button, DivWin as W, Toolbar} from 'ecp';
import DBConn from './DBConn.jsx'
import {_} from "./locale.js";

import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";

import "./jssicon.css"
import "./iconfont.css"

const ManInput = 0
const XLS = 1
const DB  = 2

const SheetJSFT = [
	"xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*"
].map(function(x) { return "." + x; }).join(",");

const fileBtn = `
<span>
    <input type="file" style="display:none" accept="${SheetJSFT}" onChange="window.handleExcelFileSelect(event)"/>
    打开数据文件
</span>
`

// UI for bind vars
function BindVar(props) {
    const sheet = useRef();
    let {bind_vars, columns, onSetHeader}=props;
    const onClick=()=>{
        onSetHeader(sheet.current[0].getData())
    }
    return (
        <div>
            <Spreadsheet ref={sheet} >
                 <Worksheet tableOverflow={true} tableWidth={"100%"} tableHeight={"400px"} data={bind_vars} columns={columns} minDimensions={[1, 1]}
                     allowInsertColumn={false} allowDeleteColumn={false} allowRenameColumn={false}
                     allowInsertRow={false} allowDeleteRow={false} 
                 />
            </Spreadsheet>
            <Button onClick={onClick}>确定</Button>
        </div>    
    )
}

var sheet;

export default function DataInput(props) {
    let {tpdata, setStep, columns, data, history, onDataChange}=props
    let [ dataType, setDataType] = useState(ManInput)
    let [ bindVars, setBindVars] = useState({})
    const dataTypeRef = useRef(dataType);
    const bindVarsRef = useRef(bindVars);
    const jssRef = useRef();
           
    const getData=(bind_vars)=>{
        let h = sheet[0].getHeaders(true);
        return sheet[0]
                .getData()
                .filter( r => r.some(c=>c!==""))
		        .map( r =>{
                    var r1={};
                    for( let col in bind_vars ) {
                        let key = bind_vars[col];
                        r1[col]=String(r[h.indexOf(key)] ||"");
                    }
                    return r1
			    })
    }
	
	//
	// 不能直接使用jspeadsheet.destoryAll, 有BUG
	//
	const destroyAllSheet = function() {		
		let n = jspreadsheet.spreadsheet.length;
		for (let spreadsheetIndex = 0; spreadsheetIndex < n; spreadsheetIndex++) {
			const spreadsheet = jspreadsheet.spreadsheet[0];
			jspreadsheet.destroy(spreadsheet.element);
		}
	}
          
    const load_excel=(e)=>{
		let inp = e.querySelectorAll('.icon-Excel>span>input')
        inp[0].click()
        inp[0].value=''
    }
    
    const prevStep=()=>{
        if (sheet && sheet[0]) {
            onDataChange(getData())
        }    
		history.push("/print-tools/seltp")
	}

	const nextStep=async()=>{
		let {sql, tpdata, rowcnt}=props;
		var data;
		
		if (dataTypeRef.current===DB || dataTypeRef.current===XLS) {
			let vars = Object.entries(bindVarsRef.current).filter(o=>o[1]!=="").map(o=>o[0])
			let tp_vars1 = tpdata.tp_vars.filter(o=>!o.startsWith("spirit."))
			for(let i=0; i<tp_vars1.length; i++) {
				let v=tp_vars1[i];
				if (vars.indexOf(v)<0) {
					W.alert(_("变量") + '"' + v + '"' + _("未绑定"));
					return;
				}
			}
		    data = getData(bindVarsRef.current)
		}else {
			data=getData(columns.reduce((acc, o)=>{ acc[o.title]=o.name; return acc}, {}))
		}
		
		if (data.length===0) {
			W.alert(_("数据不能为空"));
			return;
		}
		
		if (dataTypeRef.current===DB) {
		    sql.vars_map={}
		    for (let k in bindVarsRef.current) {
		        if (k!==bindVarsRef.current[k]) sql.vars_map[k]=bindVarsRef.current[k]
		    }
			props.onSetSql(sql, data, rowcnt)
		}else{
		    props.onDataChange(data);
		}
		props.history.push("/print-tools/doprint")
	}
	
	const excel_handler=(e)=> {
	    const files = e.target.files;
		if(files && files[0]) do_execl_handler(files[0]);
	};
	
	const do_execl_handler=(file/*:File*/)=>{
		/* Boilerplate to set up FileReader */
		const reader = new FileReader();
		const rABS = !!reader.readAsBinaryString;

		reader.onload = async (e) => {
		
			try {
			    let XLSX = await import('xlsx')
								
				/* for execel header */
				/*const make_excel_cols = refstr => {
					let o = [], range = XLSX.utils.decode_range(refstr);
					let S=range.s.c , E=range.e.c + 1;
					for(var i = 0; i < E - S; ++i) o[i] = XLSX.utils.encode_col(i);
					return o;
				};*/
				
				/* Parse data */
				const bstr = e.target.result;
				const wb = XLSX.read(bstr, {type:rABS ? 'binary' : 'array', codepage: 65001, cellDates: true});
				
				/* Get first worksheet */
				const wsname = wb.SheetNames[0];
				const ws = wb.Sheets[wsname];
				/* Convert array of arrays */
				let data = XLSX.utils.sheet_to_json(ws, {header:1, raw: false});
				
				if (data.length===0) {
					W.alert(_("没有数据"));
					return;		
				}
				
				const {tp_vars}=props.tpdata;
				let header=data[0];
				let bind_vars={};
				for(let i=0; i<header.length; i++) {
					let n = header[i] || ""
					if (n.length>0 && n[0]==='.') n=n.substring(1)
					if (n.length > 0 && tp_vars.indexOf(n)>=0) {
						bind_vars[i]=n;
					}
				}				
								
				if (Object.keys(bind_vars).length===tp_vars.filter(o=>!o.startsWith("spirit.")).length) {
					/* 认为第一行为表头, 格式和当强的columns相同*/
					data.shift()
					let d = data.map(r=>{
					    let r1={}
					    for (let i=0;i<r.length;i++) {
					        if (bind_vars[i]) {
    					        r1[bind_vars[i]]=r[i]
    					    }    
                        }
                        return r1
                    })    
					
					if (dataTypeRef.current!==ManInput) {
					    destroyAllSheet()
					    setDataType(ManInput)
					    onDataChange(d)
					}else{
    					sheet[0].setData(d)
    				}	
				}else{
				    
    				if (dataTypeRef.current!==XLS) {
    				    let yn =  await W.confirm(_("导入文件格式和当前标签不符合, 切换到自由模式吗?"))
    				    if (!yn) return
    				}    
    				
				    destroyAllSheet()
				    onDataChange(data)
				    setDataType(XLS)
				    setBindVars({})
				}
				
			}catch(e){
				console.error(e)
    		}
		};
		if(rABS) reader.readAsBinaryString(file); 
		else reader.readAsArrayBuffer(file);
	};
	
	
	const setSqlData=async ({columns: db_cols, total, data}, sql_cfg)=>{
		let {tp_vars}=props.tpdata;
		
		if (db_cols.length<tp_vars.filter(o=>!o.startsWith("spirit.")).length) {
			W.alert(_("数据查询结果不正确"))
			return;
		}			
		
		let bind_vars={};
		if (sql_cfg.vars_map && Object.keys(sql_cfg.vars_map).length>0) {
			bind_vars=sql_cfg.vars_map
		}else{
			const tp_vars1 = tp_vars.filter(o=>!o.startsWith("spirit."))	
			for (let i=0; i<tp_vars1.length; i++) {
				let item = tp_vars1[i]
				if (!db_cols.includes(item)) {
					let yn = await W.confirm(_("数据字段与标签不吻合"))
					if (yn===false) return false;
					break;
				}
			}
			
			for(let c of db_cols) {
				if (tp_vars.indexOf(c)>=0) {
					bind_vars[c]=c;
				}
			}
		}
				
		destroyAllSheet()
		
		props.onSetSql(sql_cfg, data, total)
		setDataType(DB)
		setBindVars(bind_vars)
				
		return true;
	}
	
	
	const db_conn=()=>{
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
			    onSubmit={(form, sqlcfg)=>{form.close()}}
			>
			    <DBConn setSqlData={setSqlData} sql_conf={props.sql} />
			</W.Dialog>
		); 
	}
	
	
	const var_binder=()=>{
	
	    if (dataTypeRef.current===ManInput) {
	        W.alert(_("当前状态无需设置绑定关系"))
			return;
	    }
	
	    let bind_vars = [
	                ...Object.entries(bindVarsRef.current).map(r=>({title:r[0], name:r[1]})), 
	                ...(tpdata.tp_vars?tpdata
                        .tp_vars
                        .filter(o=>!o.startsWith("spirit."))
                        .filter(o=>!(o in bindVarsRef.current))
                        .map(o=>{ return {title:o, name:''}}):[])]
	    
	    let cols = [{title:_('标签变量'), name:'title'}, {title:_('绑定到'), name:'name', type:'dropdown', source:sheet[0].getHeaders(true)}]
	    
	    const onSetHeader=(h)=>{
	        let bv={}
	        for (let  b of h) {
	            bv[b[0]]=b[1]
	        }
	        
	        setBindVars(bv)
	        dlg.close();
	    }
	    
	    let dlg = W.show(
			<W.Dialog
			    title={_("设置标签变量绑定关系")} 
			    width="300" height="500" 
			>
			    <BindVar bind_vars={bind_vars} columns={cols} onSetHeader={onSetHeader}/>
			</W.Dialog>
		); 
	}
		
	const resetData=useCallback(async ()=>{
		let yn = await W.confirm(_("清除当前数据吗？清除后不可恢复"))
		if (!yn) return;
		destroyAllSheet()
		setDataType(ManInput); 
		props.onSetSql(null, [], 0); 
		onDataChange([])
	}, [props, onDataChange, setDataType])
	
    /*
    const contextMenu = (o, x, y, e, items, section) => {
         console.log(x,y,e)
         // Reset all items
         items = [];

         // If the click was in the headers
         if (section == 'header') {
            // Items to the header only
            items.push({
                title: _('绑定列变量'),
                onclick: function() {
                    alert('test')
                }
            });

            items.push({
                title: _('在当前列前插入'),
                onclick: function() {
                    o.insertColumn(1, parseInt(x), 1)
                }
            });

            items.push({
                title: _('在当前列后插入'),
                onclick: function() {
                    o.insertColumn(1, parseInt(x), 0)
                }
            });
            
            items.push({
                 title: _('删除选中的列'),
                 icon: 'delete',
                 onclick: function () {
                     o.deleteColumn(o.getSelectedColumns().length?undefined:parseInt(x));
                 }
            });
          

            // Add a line
            items.push({ type: 'line' });
         }
         
         if (section == 'row' || section=='cell') {
            
            items.push({
                title: _('在当前行前插入'),
                onclick: function() {
                    o.insertRow(1, parseInt(y), 1)
                }
            });
            
            items.push({
                 title: _('在当前行后插入'),
                 onclick: function () {
                    o.insertRow(1, parseInt(y), 0) 
                 }
            });
             
            items.push({
                 title: _('删除当前行'),
                 icon: 'delete',
                 onclick: function () {
                     o.deleteRow(o.getSelectedRows().length?undefined:parseInt(y));
                 }
            });
         }

         return items;
    }*/
	
	useEffect(() => {
	    if (Object.keys(tpdata).length === 0) {
            history.push("/print-tools/seltp")
            return
        }
        setStep("loaddata")
        if (!window.handleExcelFileSelect) window.handleExcelFileSelect=excel_handler
        
        jspreadsheet.setDictionary({
            'Insert a new column before': '在左边增加列',
            'Insert a new column after': '在右边边增加列',
            'Delete selected columns': '删除选中的列',
            'Order ascending':'升序排列',
            'Order descending': '降序排列',
            'Insert a new row before': '在上方增加行',
            'Insert a new row after': '在下方增加行',
            'Delete selected rows': '删除选中的行',
            'Copy': '拷贝',
            'Paste': '粘贴',
        });
        
   }, [])
   
   
   useEffect(() => {
	   
        dataTypeRef.current = dataType;
        bindVarsRef.current = bindVars;
        
        const toolbars=[
            {content: 'undo', title:"undo", onclick: function () {sheet[0].undo()}},
            {content: 'redo', title:"redo", onclick: function () {sheet[0].redo()}},
            {content: 'save', title:_("保存数据"), onclick: function () {sheet[0].download(true, false)}},
            {content: 'autorenew', title:_("清除数据"), onclick: resetData},
		    {type:'divisor'},
            {content: fileBtn, title:_("加载EXCEL/CSV等格式的数据文件"), class:'iconfont icon-Excel', onclick:load_excel},
            {content: "<span>连接数据库</span>", class:'iconfont icon-database', title:"连接数据库", onclick:db_conn },
            {content: "<span>变量绑定</span>", class:'iconfont icon-icon-customvar', title:"设置字段和标签变量绑定关系", onclick:var_binder },
            {type:'divisor'},
            {content: 'fullscreen', title:"全屏编辑", onclick: function () {sheet[0].parent.fullscreen()}},
        ]
        
		if (!jssRef.current.textContent) {
		
		    let headers=[]
		    switch(dataType) {
		    case ManInput:
		        headers=JSON.parse(JSON.stringify(columns))
		        break;
    		case XLS:
		        headers= new Array(Math.max(...data.map(r=>r.length))).fill(null)
		        break;
		    case DB:
		        headers = Object.keys(data[0]).map(c=>{
        		    if (c in bindVars) {
		                return { title: bindVars[c], name: c}
		            }
		            return { title: c}
		        })
		    }
		    
		    let h = (window.document.documentElement.clientHeight - 300)+'px'
            let ws=jspreadsheet(jssRef.current, {
                toolbar: toolbars,
				tabs: false,
				//ondeletecolumn,
				//contextMenu,
				allowExport: true,
				about: false,
				worksheets: [{
                    minDimensions: [1, 20],
					tableOverflow:true,
					tableWidth:'100%',
					tableHeight:h,
					columns: headers,
					data,
					csvDelimiter:',',
					allowInsertColumn: dataType===XLS,
					allowDeleteColumn: dataType===XLS,
					allowRenameColumn: dataType===XLS,
					allowComments: false,
					
				}],
            });
			sheet=ws
        }
		
    }, [dataType, columns, data, bindVars, resetData]);
	
    return (
        <>
			<div ref={jssRef} />
            <hr/>
            <div style={{float:"right"}}>
                <Button onClick={prevStep}>{_("上一步")}</Button>
                <Button type="green" onClick={nextStep}>{_("下一步")}</Button>
            </div>
        </>
    );
}
