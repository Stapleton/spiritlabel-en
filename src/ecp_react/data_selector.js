import React from 'react';
import Table from './table.js';
import W from './divwin.js';
import Button from './button.js';
import net from './net.js';
import Icon from'./icon.js';
import InputBtn from'./input_btn.js';
import Util from './util.js';

import './glyphicons.css';
import inpcss from './input.module.scss';
import modal from './modal.module.css';
import css from './data_selector.module.css';

var cache_data={};
const cache=async (url, id, col, kv)=> {
	let c_key=`${url}/${id}/${col}/${kv}`;
	if ( c_key in cache_data) {
		return cache_data[c_key];
	}
	if (typeof url=='function') {
		let p=url('get', kv).then(rc=>{
			cache_data[c_key]=rc;
			return rc;
		})
		cache_data[c_key]=p;
		return p;
	}else{
		let p=net.get(`${url}?do=get&key=${kv}`).then(rc=>{
			cache_data[c_key]=rc.data[col];
			return rc.data[col];
		}).catch(msg=>console.log(msg));
		cache_data[c_key]=p;
		return p;
	}
}

/**
 * 输入项目，主要用于Form.js的组件
 */
const input=(props)=>{
		
	let {className, onChange, ...others}=props;
    
	let select=(value)=>{
		onChange(value)
	}
    
	return (
		<div className={className} >
			<Entry {...others} onSelect={select} />
		</div>
	)
}

/**
 * 输出项目/主要用于数据表格的显示
 */
const tp=(opt)=>(value, row)=>{
	if (typeof opt=="function") return <Entry data_fetch={opt} value={value} simple/>;
	return <Entry {...opt} value={value} simple/>
}

class Entry extends React.Component {

	constructor(props) {
		super(props)
		this.state={
			open:false,
			pull_height : 300,
			values:this.json2array(props.multi, props.value)
		}
	};
	
	json2array(multi, value) {
		let values=[];
		if (multi) {
			try{
				let v=JSON.parse(value)
				if (Array.isArray(v)) values=v;
				else values.push(''+v);
			}catch(e){}
		}else 
		if (value!=='') values.push(value);
		return values;
	}
	
	componentDidMount() {
		this.show(this.state.values);
	}
	
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.value!==this.props.value) {	
			let values=this.json2array(this.props.multi, this.props.value);
			this.setState({values});
			this.show(values)
		}
	}
	
	shouldComponentUpdate(nextProps,nextState){
		if(nextProps.value===this.props.value && 
			JSON.stringify(nextState)===JSON.stringify(this.state)) {
			return false
		}
		return true;
	}
	
	show=(values)=>{
		if (values.length===0) return;
		let {url, data_fetch, id, col}=this.props;
		if (data_fetch) url=data_fetch;
		cache(url, id, col, values[0])
			.then(name=>this.setState({name}))
			.catch(msg=>console.warn(`${values[0]}=>name error ${msg}`));
	}
	
	showDialog=()=>{
		let {width}=this.props;
		let {values}=this.state;
		let formSubmit=(form)=>{
			form.close();
		}
	    
		width = (width || 250 ) + 10;
		let height= 300;
		    
		W.show(
		  	<W.Form onSubmit={formSubmit} width={width} height={height} title={this.props.title}>
		  		<Select {...this.props} values={values} />
			</W.Form>
		);
  	}
	
	tagOpen=()=>{
		let {readOnly, multi, popup}=this.props;
		if (!multi && readOnly) return;
		if (popup) {
			this.showDialog()
		}else{
			const pos=Util.getPopPos(this.input_el, this.state.pull_width, this.state.pull_height);
			this.setState((prevState, props) =>({open: !prevState.open, pos}));
		}	
	} 
	
	onSelect=(v)=>{
		let {onSelect, multi, readOnly}=this.props;
		if (readOnly) return;
		if (multi) {
			v=JSON.stringify(v);
		}
		onSelect(v);
		this.tagOpen();
	}
	
	setRef=(el)=> {
		this.input_el = el; 
		if (el) this.state.pull_width=this.props.width?this.props.width:el.offsetWidth
    	}
	
	render() {
		let {simple, style, className, width, multi, onSelect, readOnly, ...others}=this.props;
		let {values, pull_width, pull_height}=this.state;
		let cls=Util.classNames(css.data_selector, className);
		
		if (simple) return <span>{this.state.name||values[0]||''}{values.length>1?', ...':''}</span>;
		
		width = width || multi?500:pull_width;
		let height= pull_height;
		
		return (
			<div className={cls} style={style}>
				<input
					className={inpcss.input}
					ref={this.setRef}
					value={(this.state.name||values[0]||'')+(values.length>1?', ...':'')}
					readOnly
					onClick={this.tagOpen} 
					/>
					{ this.state.open && 
						<div 
							style={{position:'fixed', top:0, bottom:0, left:0, right:0, zIndex:10}} 
							onClick={this.tagOpen} 
						/> 
					}
					{ this.state.open &&
						<div className={modal.modal} style={{width, height, ...this.state.pos}} >
							<Select values={values} multi={multi} onSelect={this.onSelect} 
								 onClose={this.tagOpen} {...others} />
						</div> 
					} 
			</div>
		);
	}
}

class Select extends React.Component {

	state={
		names:[], 
		values:[...this.props.values],
		ser_key:''
	}

	init_data=()=>{
	
		let {url, data_fetch, id, col, values, multi}=this.props;
		if (!multi) return;
		if (data_fetch) url=data_fetch;
		
		var {names}=this.state;
		var n=0;
		values.forEach(v=>{
			if (v in names) {
				if ( ++n === values.length) this.setState({names});
			}else {
				cache(url, id, col, v).then(name=>{
					names[v]=name;
					n++;
					if ( n === values.length) this.setState({names})
				})
				.catch(msg=>{n++; console.log(msg)});
			}
		})
	}
		
	componentDidMount() {
		this.init_data();
	}
	
	componentDidUpdate(prevProps, prevState) {
		if (prevProps.value!==this.props.value) this.init_data();
	}

	/**
	 * 获取服务器数据
	 */
	getData=(start, count)=>{
		let { data_fetch }=this.props;
		if (data_fetch) return data_fetch('list', start, count);
		return net.get(`${this.props.url}?do=list&_start=${start}&_count=${count}`);
	}
	
	/**
	 * 获取查询结果数据
	 */
	getSearchData=(start, count)=>{
		let { col, data_fetch }=this.props;
		let { ser_key }=this.state;
		if (data_fetch) return data_fetch('search', ser_key, start, count);
		return net.get(`${this.props.url}?do=search&col=${col}&str=${ser_key}&_start=${start}&_count=${count}`);
	}
	
	/**
	 * 查询
	 * 设置查询条件，然后调用list
	 */
	doSearch=(ser_key)=>{
		this.tbl_obj.forceUpdate()
		this.setState({ser_key});
	}
	
	sel=(record)=>{
		let {values, names}=this.state;
		let {multi, onSelect, id, col}=this.props;
		let _id=record[id];
		let _name=record[col];
		if (!multi) {
			onSelect(_id);
			if (this.props.dialog) this.props.dialog.close();
		}else{
			if (values.indexOf(_id)<0) values.push(_id);
			names[_id]=_name;
			this.setState({values, names, dirty:true});
		}
	}
	
	commit=()=>{
		let {onSelect}=this.props;
		let {values}=this.state;
		onSelect(values);
	}
	
	drop=()=>{
		if (this.state.dirty) {
			this.setState({values:[...this.props.values], dirty:false});
		}
		else this.props.onClose();
	}
	
	del=(idx)=>()=>{
		this.setState(({values})=>{
			values.splice(idx, 1)
			return {values, dirty:true}
		})
	}
	
	/**
	 * 表格相关操作
	 */
	actions=(tabObj, record)=>{
	return(
		<span>
		    <Button onClick={e=>this.sel(record)}>选择</Button>
		</span>
	)}
	
	render() {
		let {values, names, ser_key}=this.state;
		let {className, style}=this.props;
		let cls=Util.classNames(css.ds_pd, className);
		
		let columns=[
			{
				"title": "ID",
				"key": this.props.id
			},
			{
				"title": "名称",
				"key": this.props.col
			}]
		if (this.props.multi) {
			return (
				<div className={cls} style={{display:'flex', ...style}}>
					<div className={css.ds_pd_left} style={{width:204, ...style}}>
						<InputBtn icon="search" no_empty={false} onClick={this.doSearch}/>
						<p>
							<Icon name="remove" onClick={this.drop} className={css.ds_btn}/>
							<Icon name="ok" onClick={this.commit} className={css.ds_btn}  style={{float:"right"}}/>
						</p>
						<ul>
						{values.map((v,i)=><li key={i} onClick={this.del(i)}>
							{ v in names? (names[v]?names[v]:(<span style={{color:'red'}}>错误{'<'+v+'>'}</span>)): v}</li>)}
						</ul>
					</div>
					<Table className={css.ds_pd_right} columns={columns} actions={this.actions} pg_size={10} 
						getData={ser_key===''?this.getData:this.getSearchData} ref={e=>this.tbl_obj=e}
						/>
				</div>
			)	
		}else{
			return  (
				<div className={cls} style={style}>
					<div className={css.ds_pd_search}>
						<InputBtn icon="search" no_empty={false} onClick={this.doSearch}/>
					</div>
					<Table getData={ser_key===''?this.getData:this.getSearchData}  columns={columns} actions={this.actions} pg_size={10} 
						ref={e=>this.tbl_obj=e}/>
				</div>
			);
		}
	}
}
const DataSelector={input, tp}
export default DataSelector;
