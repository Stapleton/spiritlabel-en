import React from 'react';
import PropTypes from 'prop-types';
import Util from './util.js';
import TimeUtil from './timeutil.js';
import OrgInput from './orginput.js';
import DatePicker from './datepicker.js';
import TimePicker from './timepicker.js';
import {DivWin, Msg} from './divwin.js';
import './form.css';

class EditCell {
    
	setTable=(t)=>{
		this.table=t;
	}

	tp=(def)=>(v,r,key)=>{
		def = def || {}
		def.id=key;
		return this.createInput({...def}, v, r);
	}
    
	onDataChange=(def, value)=>{
		def.record[def.id]=value;
		this.table && this.table.forceUpdate();
	}

	onBlur=()=>{

	}
	    
	createInput=(def, value, record)=>{
		def.record=record;
		const type=def.type||'string';
		const cls='';
		const readOnly=false; //this.readOnlyFields.indexOf(def.id)>=0;
		
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
						className={cls}
						style={def.style} 
						type={type=='password'?'password':'text'} 
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
						timepicker={type=='datetime'}
						force_close={true}
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
			case 'person':
				return (
					<OrgInput className={cls} value={value} readOnly={readOnly} style={{...def.style, padding:0}}
						onChange={(id,name)=>this.onDataChange(def, {id:id.substring(2),name})} />
				);	
			case 'org':
				return (
					<OrgInput className={cls} value={value} showPerson={false} readOnly={readOnly} style={{...def.style, padding:0}}
						onChange={(id,name)=>this.onDataChange(def, {id:id.substring(2),name})} />
				);	
			case 'memo':
				return <div className='com-form-memo'>{value}</div>;
			case 'multi':
				/* to be implements */
				/* 多选*/
		}
	}
}

export default EditCell
