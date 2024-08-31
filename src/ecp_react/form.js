import React from 'react';
import PropTypes from 'prop-types';
import {classNames} from './util.js';
import TimeUtil from './timeutil.js';
import DatePicker from './datepicker.js';
import TimePicker from './timepicker.js';
import {DivWin} from './divwin.js';
import tb from './table.module.scss'
import css from './form.module.scss';

class Form extends React.PureComponent {

	static defaultProps = {
		fields : [],
		nCol   : 2,
		values : {},
		readOnlyFields : [],
		disable_fields : [],
		border : true,
	}
  
	static propTypes = {
		onChange : PropTypes.func
	}
	
	state={
		errors : {}
	}
	
	/* 修改数据，如果force==false, 先做检查，错误禁止修改。 */
	/* 否则先修改，然后在componentWillReceiveProps是检查（并做标记）*/
	onDataChange=(def, value, force=true)=>{
		
		if (this.readOnlyFields.indexOf(def.id)>=0) {
			this.forceUpdate();
			return;
		}
		
		if (!force) {
			const valid=this.doCheckValue(def, value);
			if (!valid) {
				const err=`字段[${def.name?def.name:def.id}]: ${this.errmsg}`;
				DivWin.alert(err, ()=>def.el && def.el.focus());
				this.forceUpdate();
				return false;
			}
		}
		
		if (this.props.onChange) this.props.onChange({...this.props.values, [def.id]:value}, def.id, value);
		return true;
	}
	
	onBlur=(def, e)=>{
		if (this.state.errors[def.id]) {
			const err=`字段[${def.name?def.name:def.id}]: ${this.state.errors[def.id]}`;
			DivWin.alert(err, ()=>def.el && def.el.focus());
			return;
		}
	}
	
	checkDataAll=(props)=>{
		const errors={}
		const values={...props.values};
		let   chg=false;
		
		/* 检查设置初始值 */
		props.fields.forEach(def=>{
			
			if (!def) return;
			
			if (/h[1-9]/.test(def.type) || def.split) return;
			
			/* 如果是选择, 当前值不在列表中，使用缺省值（或第一个值)触发一个onChange */
			if (def.type==='select' && def.options && def.options.length>0) {
				let options=def.options
				let opts=Array.isArray(options) ? options : Object.keys(options);
				if (opts.indexOf(props.values[def.id])===-1) {
					chg=true;
					values[def.id] = (typeof def.def!='undefined')?def.def:opts[0];
				}
			}else						
			/*如果没有数据，且有缺省值，触发一个onChange */
			if (typeof props.values[def.id]=='undefined' && typeof def.def!='undefined') {
				//console.log('set default', def.id, '=>', def.def)
				values[def.id]=def.def;
				chg=true;
			}
			
			if (!this.doCheckValue(def, values[def.id])) {
				errors[def.id]=this.errmsg;
			}
			
		});	
			
		/* 设置readonly Fields的初始值 */
		if (!Array.isArray(props.readOnlyFields)) {
			for( const f in props.readOnlyFields ) {
				if (typeof props.values[f]==='undefined' || props.values[f]!==props.readOnlyFields[f]) {
					//console.log('set Readonly Fields to default', f, '=>', props.readOnlyFields[f])
					values[f]=props.readOnlyFields[f];
					chg=true;
				}
			}
			this.readOnlyFields=Object.keys(props.readOnlyFields);
		}else{
			this.readOnlyFields=props.readOnlyFields;
		}
		
		if (chg) this.props.onChange(values);
		this.setState({errors});
	}
		
	createInput=(def, idx)=>{
		const type=def.type||'string';
		const value=typeof this.props.values[def.id]!='undefined'?this.props.values[def.id]:(typeof def.def!='undefined'?def.def:''); 
		const cls=this.state.errors[def.id]?css["inp-error"]:css['inp'];
		const readOnly=this.readOnlyFields.indexOf(def.id)>=0;
		
		/* 自定义控件 */
		if (def.component){
			const value1=value;
			let { className, onChange, ...others}=def.params ||{};
			const props={className:cls, value:value1, onChange:v=>this.onDataChange(def, v), ...others}
			const component=def.component;
			return React.createElement(component, props);
		}	
		
		switch(type){
			default:
			case 'int':
			case 'float':
			case 'string':
			case 'password':
				/*FIXME: 这里应该实现通过Option选择*/
				return (
					<input
						spellCheck="false"
						className={cls}
						style={def.style} 
						type={type==='password'?'password':'text'} 
						value={value}
						readOnly={readOnly}
						ref={(el) => { def.el = el }} 
						onBlur={(e)=>this.onBlur(def, e)}
						onChange={(e)=>this.onDataChange(def, e.target.value)} 
						placeholder = {def.placeholder || def.hint}
					/>);
			case 'text':
				return (
					<textarea 
						spellCheck="false"
						className={cls}
						style={def.style} 
						value={value} 
						readOnly={readOnly}
						ref={(el) => { def.el = el }} 
						onChange={(e)=>this.onDataChange(def, e.target.value)} 
						onBlur={(e)=>this.onBlur(def, e)}
					/>);
			case 'time':
					return (
						<TimePicker
							className={cls}
							style={{...def.style, padding:0}} 
							value={value}
							readOnly={readOnly}
							format='str'
							onChange={(v)=>this.onDataChange(def,v)} 
						/>);
			case 'date':
			case 'datetime':
				return (
					<DatePicker
						className={cls}
						style={{...def.style, padding:0}} 
						value={value}
						readOnly={readOnly}
						timepicker={type==='datetime'}
						force_close={false}
						onChange={(v)=>this.onDataChange(def, v, false)} 
					/>);
			case 'bool':
				return (
					<select  
							className={cls}
							style={def.style} value={value} readOnly={readOnly}
							onChange={(e)=>this.onDataChange(def, e.target.value,false)}
						>
							<option key={1} value={1}>是</option>
							<option key={2} value={0}>否</option>
					</select>
				);
			case 'select':
				let opts=[];
				if (Array.isArray(def.options)) {
					opts=def.options.map((o,i)=><option key={i}>{o}</option>)
				}else{
					for(var key in def.options) 
						opts.push(<option key={key} value={key}>{def.options[key]}</option>);
				}	
				return (
					<select
							className={cls}  
							style={def.style} value={value} readOnly={readOnly}
							onChange={(e)=>this.onDataChange(def, e.target.value, false)}>
							{opts}
					</select>
				);
			case 'memo':
				return <div className='com-form-memo'>{value}</div>;	
				
			case 'multi':
				{
					let opts=[];
					let values=value;
					if (typeof value==="string") values=[value];
					
					if (Array.isArray(def.options)) {
						opts=def.options.map((o,i)=><option key={i}>{o}</option>)
					}else{
						for(let key in def.options) 
							opts.push(<option key={key} value={key}>{def.options[key]}</option>);
					}	
					return (
						<select
								className={cls}  
								style={def.style} value={values} readOnly={readOnly}
								onChange={(e)=>this.onMulSelChange(def, value, e.target.value, false)}>
								{opts}
						</select>
					);
				}
		}
	}
	
	/**
	 * 完成对输入数据的检查
	 * @pram def 当前的输入定义项目 
	 * @param value 待检查的值
	 */
	doCheckValue=(def, value)=>{
		this.errmsg=def.errmsg?def.errmsg:'输入格式有错';
		if (value==='' || typeof value==='undefined') {
			if (!def.require) return true;
			this.errmsg='输入项目不能为空';
			return false;
		}	
		if (def.type==='bool' || def.type==='select') return true;
		
		var regex=def.regex;
		if (!regex) {
			if (def.type==='int') { regex='^\\d+$'; this.errmsg='输入应为整数';}
			else if(def.type==='float') { regex='^\\d+\\.{0,1}\\d*$'; this.errmsg='输入应为有效的数字';}
			else if(def.type==='date') { regex='^\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}$'; this.errmsg='日期格式应为YYYY/MM/DD'; }
			else if(def.type==='datetime') { 
				regex='^\\d{4}[/-]\\d{1,2}[/-]\\d{1,2}\\s+\\d{2}:\\d{2}:\\d{2}$'; 
				this.errmsg='日期时间格式应为YYYY/MM/DD hh:mm:ss'; 
			}
		}
		
		if (regex) {
			var reg = new RegExp(regex);
			if (!reg.test(value)) {
				return false; 
			}	
		}
		
		if (!def.range) return true;
			
		if (def.type==='int' || def.type==='float') {
			value=parseFloat(value);
			
			if (value<def.range[0] || value>=def.range[1]) {
				this.errmsg='应大于等于'+def.range[0]+',小于'+def.range[1];
				return false;
			}
			return true;	
		}
		
		if (def.type==='date' || def.type==='datetime') {
			const d   = TimeUtil.parse(value).getTime();
			const min = TimeUtil.parse(def.range[0]).getTime();
			const max = TimeUtil.parse(def.range[1]).getTime();
			
			if (d<min || d>max) {
				this.errmsg='应大于等于'+def.range[0]+',小于'+def.range[1];
				return false;
			}
			return true;	
		}	
		
		if (def.type==='time') {
			const d   = TimeUtil.parseTime(value);		
			const min = TimeUtil.parseTime(def.range[0]);
			const max = TimeUtil.parseTime(def.range[1]);
			
			if (d<min || d>=max) {
				this.errmsg='应大于等于'+def.range[0]+'且小于'+def.range[1];
				return false;
			}
			return true;	
		}
				
		return true;
	}
	
	/* 外部接口 */
	
	/*判断表单是否正确完成*/
	isValid=()=>{
		return Object.keys(this.state.errors).length===0;
	}
	
	/* 获取表单的错误信息 format: {var_id : error} */
	getErrors=()=>{
		return this.state.errors;
	}
	
	/* 获取表单的错误信息string */
	getErrorString=()=>{
		const errs=[];
		for (let i in this.state.errors) errs.push(`${this.id2name[i]}: ${this.state.errors[i]}`);
		return errs;
	}
	
	componentWillMount() {
		this.checkDataAll(this.props);
	}
	
	componentWillReceiveProps(nextProps){
		if (JSON.stringify(this.props.values)!==JSON.stringify(nextProps.values)) {
			this.checkDataAll(nextProps);
		}
	}
	
	render() {
		const {className, style, fields, nCol, disable_fields, border}=this.props;
		let bodys=[]
		let row=[];
		let cnt=0;
		
		this.id2name={}
		fields.forEach(def=>{
			if (!def) return;
			if (/h[1-9]/.test(def.type) || def.split) return;
			this.id2name[def.id]=def.name?def.name:def.id;
		})
		
		fields.forEach((f, idx)=>{
		
			if (!f) return;
			
			if (f.disable) return;
			
			if (disable_fields===f.id || disable_fields.indexOf(f.id)>=0 ) return;
			
			if (/h[1-9]/.test(f.type) || f.split) {
				if (cnt%nCol!==0) {
					for(let i=cnt%nCol; i<nCol; i++) {
						row.push(<td key={'c'+i}/>);
						row.push(<td key={'c'+i+"'"}/>);
					}
					cnt+=cnt%nCol;	
				}
				bodys.push(<tr key={'r'+bodys.length}>{row}</tr>);row=[];
				bodys.push(<tr key={'r'+bodys.length}><td className={'split '+(f.type?f.type:'')} colSpan={nCol*2}>{f.split?f.split:f.title}{f.buttons}</td></tr>);
				return;
			}
						
			if (cnt%nCol===0 && cnt!==0 && row.length!==0) {
				bodys.push(<tr key={'r'+bodys.length}>{row}</tr>);row=[];
			}
			
			let colspan={};
			if (f.colspan) {
				var v=Math.min(nCol-(cnt%nCol), Math.min(f.colspan, nCol));
				colspan={colSpan:v*2-1};
				cnt+=v-1;
			}
			
			row.push(<th key={idx} className='form-title'>{f.name?f.name:f.id}</th>);
			row.push(
				<td key={idx+"'"} className='form-inp' 
						title={(this.state.errors[f.id])?('错误:'+this.state.errors[f.id]):(f.hint?f.hint:(f.name?f.name:f.id))} 
						{...colspan}>
						{this.createInput(f, idx)}
				</td>
			);
			cnt++;
		});
		
		if (cnt%nCol!==0) {
			for(let i=cnt%nCol; i<nCol; i++) {
				row.push(<td  key={'c'+i}/>);
				row.push(<td  key={'c'+i+"'"}/>);
			}
		}
		if (row.length!==0) bodys.push(<tr key={'r'+bodys.length}>{row}</tr>);
		
		const cls=classNames(border?tb.table:css.no_border, css.form, className);
		return (
			<div>
				<table className={cls} style={style}>
					<tbody>
						{bodys}
					</tbody>	
				</table>
			</div>	
		)
	}
}

export default Form;
