import React from 'react';
import {Table, Button, ConfirmButton, DivWin as W, Toolbar, Form} from 'ecp';
import {classNames} from 'ecp';
import {_} from "./locale.js";


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
    
    show_help=()=>{
        let url = "https://www.printspirit.cn/doc/label_print.md#use_db"
        if (window.SPIRIT.type==="desktop") {
            window.runtime.BrowserOpenURL(url);
        }else{
            window.open(url, "_blank");
        }    
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
                		    <Button onClick={this.show_help}>{_("使用说明")}</Button>
            		    </Toolbar.Ext>
            		 </Toolbar>
                </div>
            </div>
        )
    }
}



export default DBConn
