import React from 'react';
import Util from './util.js';
import {parseTime} from './timeutil.js';
import css from './timepicker.module.scss';

class TimePicker extends  React.PureComponent {

	static defaultProps = {
		format  : 'timestamp', /*数据格式: timestamp(实际是0-86400秒）, str ： hh:mm:ss 24小时*/
		value   : 0,
		onChange: function(v){}
  }
  
	constructor(props){
		super(props);
		this.state=this.calState(this.props);
	}
	
	calState=(props)=>{
		let value=props.value;
		if (props.format!=='timestamp') value=parseTime(value);
		
		return ({
				value : props.value,
				hour : Math.floor((value%86400)/3600),
				min  : Math.floor((value%86400%3600)/60),
				sec  : Math.floor((value%86400%3600%60))
			});
	}
	
	onHourChg=(e)=>{
		const hour=parseInt(e.target.value);
		const value=this.getValue(hour, this.state.min, this.state.sec);
		this.setState({value, hour});
		this.props.onChange(value);
	}
	
	onMinChg=(e)=>{
		const min=parseInt(e.target.value);
		const value=this.getValue(this.state.hour, min, this.state.sec);	
		this.setState({value, min});
		this.props.onChange(value); 
	}
	
	onSecChg=(e)=>{
		const sec=parseInt(e.target.value);
		const value=this.getValue(this.state.hour, this.state.min, sec);	
		this.setState({value, sec});
		this.props.onChange(value); 
	}
	
	getValue=(hour, min, sec)=>{
		if (this.props.format==='timestamp') return hour*3600+min*60+sec;
		else return `${('0'+hour).substr(-2)}:${('0'+min).substr(-2)}:${('0'+sec).substr(-2)}`;
	}
	
	componentWillReceiveProps=(nextProps, nextState)=>{
		if (this.state.value!==nextProps.value) {
			this.setState(this.calState(nextProps));
		}
	}
		
	render() {
		const {className}=this.props;
		const cls=Util.classNames(className, css.timepicker);
		var hsel=[], msel=[], ssel=[];
		for(var i=0; i<24; i++) hsel.push(<option key={i} value={i}>{('0'+i).substr(-2)}</option>);
		for(i=0; i<60; i++) msel.push(<option key={i} value={i}>{('0'+i).substr(-2)}</option>);
		for(i=0; i<60; i++) ssel.push(<option key={i} value={i}>{('0'+i).substr(-2)}</option>);
		
		return (
			<div className={cls} >
				<select value={this.state.hour} 
					onChange={this.onHourChg}>{hsel}</select>时
				<select value={this.state.min}
					onChange={this.onMinChg}>{msel}</select>分
				<select value={this.state.sec}
					onChange={this.onSecChg}>{ssel}</select>秒	
			</div>
		)	
	}
}

export default TimePicker;
