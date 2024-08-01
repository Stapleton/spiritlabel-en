import React from 'react';
import Icon from './icon.js';
import Util from './util.js';
import btn from './button.module.scss'
import css from './input_btn.module.scss'

class InputBtn extends React.Component {
	
	static defaultProps = {
		no_empty:true,
		defaultValue : ''
	}
	
	state={
		value:this.props.defaultValue
	}
	
	onChange=(e)=>{
		this.setState({value:e.target.value});
	}
	
	onClick=(e)=>{
		if (this.props['no_empty'] && this.state.value==='') return; 
		if (this.props.onClick) this.props.onClick(this.state.value);
	}
	
	onKeypress=(e)=>{
		if (this.props['no_empty'] && this.state.value==='') return; 
		if (e.key==='Enter' && this.props.onClick) this.props.onClick(this.state.value); 
	}
		
	render() {
		const {className, style, icon, placeholder, children}=this.props;
		const cls=Util.classNames(css.groupbtn, className);
		return  (
			<div className={cls} style={style}>
				<input value={this.state.value} onChange={this.onChange} onKeyDown={this.onKeypress} placeholder={placeholder}/>
				<button className={btn.button} onClick={this.onClick} >{icon && <Icon name={icon}/> }{children}</button>
			</div>
		);
	}	
}

export default InputBtn;
