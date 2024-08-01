import React from 'react';
import Icon from './icon';
import Calendar from './calendar';
import TimePicker from './timepicker.js'
import Util from './util';
import './glyphicons.css';
import modal from './modal.module.css';
import css from './datepicker.module.scss';

class DateInput extends React.PureComponent {
	
	static defaultProps = {
		value:null,
		timepicker: false,
		force_close: true
	}
  
  constructor(props){
		super(props);
		
		this.state={
			open  : false,
			pos   : null,
			pull_width  : this.props.width || 250,
			pull_height : 231,
			...this.getInitState(this.props)
		}
	}
	
	getInitState=(props)=>{	
		const st={date:null, time:'00:00:00', tmptime:'00:00:00'}
		
		if (!props.value) return st;
		
		let m=props.value.match(/^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/);
		if (m) {
			st.date=`${m[1]}-${m[2]}-${m[3]}`;
			st.time=`${m[4]}:${m[5]}:${m[6]}`;
			st.tmptime=st.time;
			return st;
		}
		
		m=props.value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
		if (m) {
			st.date=`${m[1]}-${m[2]}-${m[3]}`;
		}
		return st;
	}
    
	tagOpen=()=>{
		if (this.props.readOnly) return;
		const pos=Util.getPopPos(this.input_el, this.state.pull_width, this.state.pull_height);
		this.setState((prevState, props) =>({open: !prevState.open, pos}));
	}    
	
	onSelect=(year, month, day)=>{
		const date=`${year}-${('0'+(month+1)).substr(-2)}-${('0'+day).substr(-2)}`;
		const time=this.state.tmptime;
		const {timepicker, force_close, onChange} = this.props;
		let open=false;
		if (typeof onChange=='function') {
			if (timepicker) open=(!(onChange(`${date} ${time}`) || force_close ));
			else open=(!(onChange(date) || force_close));
		}
		if (!open) this.setState({date, time, open});
	}
	
	onStoreTime=(e)=>{
		if (!this.state.date) return;
		let open=false;
		const time=this.state.tmptime;
		const {timepicker, force_close, onChange} = this.props;
		if (typeof onChange=='function') {
			if (timepicker) open=!(force_close || onChange(`${this.state.date} ${time}`));
			else open=!(force_close || onChange(this.state.date));
		}
		if (!open) this.setState({time, open});	
	}
	
	onTimeChange=(time)=>{
		this.setState({tmptime:time});
	}
	
	componentWillReceiveProps(nextProps){
		if (this.props.value!==nextProps.value) this.setState(this.getInitState(nextProps));
	}
	        
	render() {
		const {style, className, width, onSelect, dateCellRender, ...others}=this.props;
		const cls=Util.classNames(css.datepicker, className);
		return (
			<div className={cls} style={style} {...others} >
				<input
					ref={(el)=>{this.input_el = el}}
					value={this.state.date?(this.state.date+(this.props.timepicker?` ${this.state.time}`:'')):''}
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
						<div className={modal.modal} style={{width : this.state.pull_width, height: this.state.pull_height, ...this.state.pos}} >
							<Calendar toolbar onSelect={this.onSelect} value={this.state.date} dateCellRender={dateCellRender}/>
							{ this.props.timepicker && 
								<div className={css['datepicker-time']}>
									<Icon name='time' onClick={this.onStoreTime} className={css["datepicker-time-icon"]}/>
									<TimePicker value={this.state.tmptime} onChange={this.onTimeChange} format='str'/>
								</div>
							}	
						</div> 
				}   
			</div>
		) 
	}
}

export default DateInput;
