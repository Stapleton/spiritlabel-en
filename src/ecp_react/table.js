import React from 'react';
import PropTypes from 'prop-types';
import Util from './util';
import net from './net';
import css from './table.module.scss';

const styles={
	cur_cell : { border:"solid 1px #888" }
}

class Table extends React.Component {
	
	static propTypes = {
		data    : PropTypes.array,
		getData : PropTypes.func,
		dataUrl : PropTypes.string,
		actions : PropTypes.func, 
		edit    : PropTypes.bool,
		select_multi : PropTypes.bool,
		check   : PropTypes.bool,
		onSelect : PropTypes.func,
		onSelectChange : PropTypes.func,
	}
	
	static defaultProps = {
		pg_size : 20,
		pg_size_svr : 500, /* 一次加载500条*/
		pager_cnt : 10,  /* 分页器，一次显示10页 */
		max_pager_cnt : 15,  /*分页器不分页的最大页数*/
		select_multi : true,
		data : [],
		edit : false,
		check : false,
	}

	constructor(props) {
		super(props);
		
		const data=(this.props.data || [] ).map((o,i)=>({_key:i, ...o}));
				
		this.state={
			data    : data,
			cnt     : 0,
			pg_size_svr: this.props.pg_size_svr,
			cur_pg:0,      /* 当前页 */
			cur_pg_svr:0,   /* 对应的当前服务器页 */
			sel_page : false,
			selected : [],
			in_edit  : false, 
			in_focus : false,
			cur_row  : 0, 
			cur_col  : 0,
		};

		let pg_size=this.props.pg_size;
		
		if (this.props.dataUrl && (this.state.pg_size_svr%pg_size)!==0) {
			console.warn('pg_size_svr必须是pg_size的整倍数');
			this.state.pg_size_svr=Math.ceil(this.state.pg_size_svr/pg_size)*pg_size
		}
	}
		
	/** begin APIs : those APIs can be called to control table behiver */
	
	/* 设置当前页 */
	setPage=(cur_pg)=>{
		let pg_size=this.props.pg_size||10;
		let cur_pg_svr=this.state.pg_size_svr===0?0:Math.floor(cur_pg*pg_size/this.state.pg_size_svr)
		this.setState({cur_pg, cur_pg_svr, sel_page:false});
	}
	
	/* 返回当前表格数据，一般用于编辑后的数据获取或者服务器加载的数据的获取*/
	getData=()=>{
		return this.state.data;
	}
	
	/* 返回当前表格选中的数据, 将_key=>Row*/
	getSelected=()=>{
		let { dataUrl, getData}=this.props;
		let { selected, data } = this.state;
		let sel=[];
		if (dataUrl || getData) {
			selected.forEach(s_key=>{
				for (const blk_id of Object.keys(data)) {
					let s = data[blk_id].find(e=>e._key===s_key);
					if (s) {
						sel.push(s);
						break;
					}
				}
			})
		}else{
			selected.forEach(s_key=>{
				let s = data.find(e=>e._key===s_key);
				if (s) sel.push(s);
			})
		}
		return sel;
	}
	
	/* 清除选中数据*/
	selectNone=()=>{
		this.setState({selected:[]});
	}
	
	/* 全部选中 */
	selectAll=()=>{
		let { dataUrl, getData, select_multi}=this.props;
		if (dataUrl || getData) return false; /* 服务器数据容许全部选中*/
		if (!select_multi) return false; /* 单选方式不容许全部选中*/
		let { data } = this.state;
		
		this.setState({selected:data.map(o=>o._key)});
	}	
	
	/* 强制更新表格, 如果是服务器数据，将清空本地缓存，重新从服务器加载*/
	forceUpdate=()=>{
		const { dataUrl, getData}=this.props;
		if (dataUrl || getData) this.setState({data:[], selected:[]});
		else super.forceUpdate();
	}
	
	/* 重新加载数据 */
	refreshData=()=>{
		const { dataUrl, getData}=this.props;
		if (dataUrl || getData) this.setState({data:[], selected:[], cur_pg:0, cur_pg_svr:0});
		else {
			const data=this.props.data.map((o,i)=>({_key:i, ...o}));
			this.setState({cur_pg:0, data, selected:[]});	
		}
	}
	
	/* 删除行。 注意：这里只删除了显示数据，真实地删除需要在父控件中做*/
	del=(record)=>{
		this.splice(record, 1);
	}
	
	/* 在当前行插入一行, 无nr插入空白行*/
	insert=(record, nr)=>{
		/* 只能在data模式append */
		let {dataUrl, getData}=this.props;
		if (dataUrl || getData)  return;
		let {data}=this.state;
		if (!nr) nr={}
		
		//let p=data.findIndex(o=>o._key===record._key)
		let p=-1;
		for (let i=0; i<data.length; i++) {
			let o=data[i];
			if (o._key===record._key) {
				p=i;
				break;
			}
		}
		if (p===-1) return;
		data.splice(p, 0, nr);
		data.forEach((o,i)=>data._key=i);
		this.setState({data});
	}
	
	/* 在最后插入一行*/
	append=(nr)=>{
		/* 只能在data模式append */
		let {dataUrl, getData, pg_size}=this.props;
		if (dataUrl || getData)  return;
		let {data}=this.state;
		if (!nr) nr={} ;//this.props.columns.reduce((a,o)=>{a[o.key]=''; return a;}, {});
		nr._key=data.length;
		data.push(nr);
		
		let cur_pg = Math.floor(data.length/pg_size);
		if (cur_pg*pg_size===data.length) cur_pg--;
		this.setState({cur_pg, data});
	}
	
	/** endof APIs  */
	
	componentDidUpdate(prevProps, prevState) {
		if (
			this.props.dataUrl!==prevProps.dataUrl ||
			this.props.getData!==prevProps.getData ||
			this.props.data!==prevProps.data
		){ 
			/* data source changed */
			if (this.props.data) {
				const data=this.props.data.map((o,i)=>({_key:i, ...o}));
				this.setState({cur_pg:0, data, selected:[]});
			}else {
				this.setState({cur_pg:0, cur_pg_svr:0, data:[], selectd:[]}, this.load_data);
			}
		}
	}
	
	/*componentWillReceiveProps(nextProps){
		if (!this.props.dataUrl && nextProps.data && this.props.data!=nextProps.data) {
			const data=nextProps.data.map((o,i)=>({_key:i, ...o}));
			this.setState({cur_pg:0, data});
		}else if (this.props.dataUrl && nextProps.dataUrl && this.props.dataUrl!=nextProps.dataUrl) {
			this.setState({cur_pg:0, cur_pg_svr:0, data:[]}, this.load_data);
		}
	}*/
  	
	
	load_data=async ()=>{
		
		let {data, cur_pg_svr, pg_size_svr}=this.state;
		if (typeof data[cur_pg_svr]!='undefined') return;
		
		try{
			let d = await (this.props.getData ? this.props.getData : this.dataLoader)(
					cur_pg_svr*pg_size_svr, pg_size_svr);
			if (!d) {
				console.log("data format not : {data:[], cnt}");
				return;
			}
			d.data = d.data || []
			this.setState((prevState, props) =>{
				d.data.forEach((o,i)=>{ if (o) o._key= i + prevState.cur_pg_svr * pg_size_svr });
				prevState.data[prevState.cur_pg_svr]=d.data ;
				prevState.cnt=d.cnt;
				return prevState;
			});
		}catch(err) {
			console.log(err);
			this.setState({st_msg:''+err})
		}
	}
		
	/* Load data from dataUrl */	
	dataLoader=(_start, _count)=>{
		return net.get(`${this.props.dataUrl}`, {_start, _count});
	}
	
	on_select_row(row) {
		let {onSelectChange, onSelect, select_multi}=this.props;
		let {selected}=this.state;
		let id=row._key;
		
		let i=selected.indexOf(id);
		if (onSelect) onSelect(row, i<0);
		
		if (i>=0) selected.splice(i,1);
		else {
			if (select_multi) {
				selected.push(id);
			}else{
				selected[0]=id;
			}
		}
		if (onSelectChange) onSelectChange(selected, this);
		else this.setState({selected});
	}		
	
	on_select_page=()=>{ 
		let {dataUrl, getData, pg_size, onSelect, onSelectChange}=this.props;	
		let {data, cur_pg, cur_pg_svr, pg_size_svr, sel_page, selected}=this.state;
		
		if (dataUrl || getData) {
			let beg=cur_pg*pg_size - cur_pg_svr * pg_size_svr;
			for (let i = beg; (i< beg + pg_size) && ( i< data[this.state.cur_pg_svr].length) ; i++) {
				if (onSelect) onSelect(data[cur_pg_svr][i], !sel_page);
				let id=data[cur_pg_svr][i]._key;
				if (sel_page) {
					let _i=selected.indexOf(id);
					if (_i>=0) selected.splice(_i,1);
				}else{
					selected.push(id);
				}
			}
		}else{
			for (let i = cur_pg*pg_size;	i<(cur_pg+1)*pg_size && i<data.length; i++) {
				if (onSelect) onSelect(data[i], !sel_page);
				let id=data[i]._key;
				if (sel_page) {
					let _i=selected.indexOf(id);
					if (_i>=0) selected.splice(_i,1);
				}else{
					selected.push(id);
				}
			}
		}
		
		sel_page=!sel_page;
		//去重数据
		selected=selected.filter((value, index, self)=>self.indexOf(value) === index);
		if (onSelectChange) onSelectChange(selected, this);
		this.setState({sel_page, selected});
	}
	
	setTableRef=e=>{
		this.table_ref=e;
	}
	
	on_table_focus=e=>{
		this.setState({in_focus:true})
	}
	
	on_table_blur=e=>{
		this.setState({in_focus:false})
	}
		
	table_key_process=e=>{
		let {cur_row, cur_col, data}=this.state;
		const { pg_size, columns}=this.props;
		let max_cols=columns.length
		switch(e.key) {
			case "ArrowUp":
				if (cur_row>0) {
					cur_row--;
					let cur_pg = Math.floor(cur_row/pg_size);
					e.preventDefault();
					this.setState({cur_row, cur_col, cur_pg});
				}
				break;
			case "ArrowDown":
				if (cur_row<data.length - 1) {
					cur_row++;
					let cur_pg = Math.floor(cur_row/pg_size);
					e.preventDefault();
					this.setState({cur_row, cur_col, cur_pg});
				}
				break;
			case "ArrowLeft":
				if (cur_col>0) cur_col--;
				e.preventDefault();
				this.setState({cur_row, cur_col});
				break;
			case "ArrowRight":
				if (cur_col<max_cols - 1) cur_col++;
				e.preventDefault();
				this.setState({cur_row, cur_col});
				break;
			case "Enter":
				this.setState({in_edit:true}) 
				//e.preventDefault();
				//e.stopPropagation();
				break;
			default:
				/* do nothing */
		}
	}
	
	/* 浮动输入框设定焦点*/
	inputSetFocus=e=>{
		if (e) e.focus();
	}
	
	/* 进入编辑*/	
	goEdit=e=>{
		this.setState({in_edit:true});
	}
	
	/* 编辑状态下回车编辑下一个*/
	goNextCell=e=>{
		if (e.keyCode===13) {
			let {cur_row, data}=this.state;
			const { pg_size}=this.props;
			if ( cur_row < data.length -1 ) {
				cur_row++ 
				let cur_pg = Math.floor(cur_row/pg_size);
				//e.preventDefault();
				//e.stopPropagation();
				this.setState({cur_row, in_edit:false, cur_pg})
			}
		}
	}
	
	/* 选择单元*/
	selectCell=(cur_row, cur_col)=>e=>{
		this.setState({cur_row, cur_col});
	}
	
	/* 修改单元*/
	changeCell=(r,key)=>e=>{
		let {data}=this.state;
		r[key]=e.target.value;
		this.setState({data});
	}

	row=(i, r)=>{
		let {check, edit}=this.props;
		let {selected, in_focus,  in_edit, cur_row, cur_col}=this.state;
		let key=0;
		if (r && r[this.props.delmark]) return null;
		
		if (!r) return null;

		return (
			<tr key={i}>
				{ check && <td key={key++}><input type="checkbox" 
					checked={selected.indexOf(r._key)>=0}
					onChange={e=>this.on_select_row(r)} /></td>
				}
				{
					this.props.columns.map((o, col)=>{
						let v= r[o.key] || '';
						if (edit) {
							if (in_focus && i===cur_row && col===cur_col) {
								if (in_edit) {
									return <td key={key++} style={{width:o.width}}><input spellCheck={false}
											onChange={this.changeCell(r,o.key)}
											onKeyDown={this.goNextCell} 
											ref={this.inputSetFocus}
											value={v} /> 											</td>
								}else{
									return <td key={key++} style={{width:o.width}}><div style={styles.cur_cell} 
											onDoubleClick={this.goEdit}
											>{v}</div>
											
										</td>;
								}
							}else{
								return <td key={key++} style={{width:o.width}} 
									onClick={this.selectCell(i, col)}><div>{v}</div></td>;
							}
						}	
						else if (typeof o.tp=='undefined') return <td key={key++}>{v}</td>;
						else if (typeof o.tp=='function') return <td key={key++}>{o.tp(v, r, o.key)}</td>;
						else return <td key={key++}>{o.tp[v]?o.tp[v]:''}</td>;
					})
				}
				{ this.props.actions && <td className={css.ca}>{this.props.actions(this, r, i)}</td>}	
			</tr>
		)
	}	
	
	// record
	// how_many : 删除数量 del时=1， insert 时=0
	// n_ele 插入的数据
	splice=(record, how_many, n_ele)=>{
		this.setState((prevState) =>{
			let data;
			if (this.props.dataUrl || this.props.getData) {
				data=prevState.data[this.state.cur_pg_svr];
				for(let i=0; i<data.length; i++) {
					if (record._key===data[i]._key) {
						if (n_ele) data.splice(i, how_many, n_ele);
						else data.splice(i, how_many);
						break;
					}
				}
			}else{
				for(let i=0; i<prevState.data.length; i++) {
					if (record._key===prevState.data[i]._key) {
						if (n_ele) prevState.data.splice(i, how_many, n_ele);
						else prevState.data.splice(i, how_many);
						break;
					}
				}
			}
			return prevState;
		})	
	}
	
	/* 分页 */
 	pager=()=>{
 		const { pg_size, dataUrl, getData, pager_cnt, max_pager_cnt}=this.props;
		const { cnt, cur_pg, data }=this.state;
		let p=[];
		let pg_cnt;
		
 		if (dataUrl || getData) pg_cnt=Math.ceil(cnt/pg_size);
		else pg_cnt=Math.ceil(data.length/pg_size);
		
		if (pg_cnt<=1) return null;
		
		/* 如果大于同时显示的page数*/
		if ( pg_cnt>max_pager_cnt && cur_pg > pager_cnt) {
			p.push(<span key='hd' className={css.pg} onClick={()=>this.setPage(0)}>首页</span>)
			p.push(<span key='prev' className={css.pg} onClick={()=>this.setPage(cur_pg - pager_cnt )}>{'<'}</span>)
		}
		
		let first=Math.floor(cur_pg/pager_cnt)*pager_cnt;
		for(let i=first; i<Math.min(pg_cnt, first+pager_cnt); i++) 
			p.push(<span key={i} className={cur_pg===i?`${css.pg} ${css.cur}`:css.pg} onClick={()=>this.setPage(i)}>{i+1}</span>);
		
		if (pg_cnt>max_pager_cnt && cur_pg + pager_cnt < pg_cnt) {
			p.push(<span key='next' className={css.pg} onClick={()=>this.setPage(cur_pg + pager_cnt )}>{'>'}</span>)
			p.push(<span key='tail' className={css.pg} onClick={()=>this.setPage(pg_cnt-1)}>尾页</span>)
		}
	 	return <span className={css.pager}>{p}</span>;
 	}
	
	/* 显示服务器加载的数据 */
	renderRemoteRows=()=>{
		let {pg_size, columns, actions}=this.props;
		let {data, cur_pg, cur_pg_svr, pg_size_svr, st_msg}=this.state;
		
		if (typeof data[cur_pg_svr]=='undefined') {
			let colspan=columns.length + (actions?1:0);
			if (!st_msg) this.load_data();
			return <tr><td colSpan={colspan}>{st_msg ||'数据加载中'}</td></tr>;
		}
		let rows=[];
		let beg=cur_pg*pg_size - cur_pg_svr * pg_size_svr;
		for (let i = beg; (i< beg + pg_size) && ( i< data[this.state.cur_pg_svr].length) ; i++) {
				rows.push(this.row(i, data[cur_pg_svr][i]));
		}
		return rows;
 	}
 	 	
 	/* 显示props.data数据 */
 	renderRows=()=>{
	 	let {pg_size}=this.props;
	 	let {data, cur_pg}=this.state;
		let rows=[];
		if (!data) return rows;
		
	 	for (let i = cur_pg*pg_size;	
			i<(cur_pg+1)*pg_size && i<data.length;
			i++)
		{
 	  		rows.push(this.row(i, data[i]));
		}
		return rows;
	}
	
	render() {
		let {columns, actions, check, select_multi, dataUrl, getData, className, style, edit }=this.props;
		let {sel_page}=this.state;
		let cls=Util.classNames(css.tablediv, className, {[css.editable]:edit});
	
		let key=0;
		let head=(h)=>{
			return <th key={key++} style={h.style}>{h.title}</th>;
		}
								
		return  (
			<div className={cls} style={style}> 
				{this.pager()}
				<table className={css.table} tabIndex="1" 
					ref={this.setTableRef}
					onKeyDown={this.table_key_process} 
					onFocus={this.on_table_focus}
					onBlur={this.on_table_blur}
				>
					<thead>
						<tr>
							{check && 
								<th>{select_multi?
									<input type='checkbox' checked={sel_page} onChange={this.on_select_page}/>:''}
								</th>}
							{columns && columns.map(head)}
							{actions && <th className={css.ca}>操作</th>}
						</tr>
					</thead>
					<tbody>
						{(dataUrl || getData)? this.renderRemoteRows():this.renderRows()}
					</tbody>
				</table>	
			</div>	
		);
	}	
}

export {Table as default}
