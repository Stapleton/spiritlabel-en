import React from 'react';
import ReactDOM from 'react-dom';
import './modal.css';
import Util from './util.js';
import Icon from './icon.js';

class PulldownButton extends React.Component {
	
	static defaultProps = {
  }

	state={
    open : this.props.isOpen || false,
		pull_width  : this.props.width || 150,
		pull_height : this.props.height || 300
  }
    
	tagOpen=(e)=>{
		const pos=Util.getPopPos(this.input_el, this.state.pull_width, this.state.pull_height);
		this.setState((prevState, props) => ({open: !prevState.open, pos}));
		e.stopPropagation()
	}    
	
	onMouseOver=(e)=>{
		if (this.state.open) return;
		this.setState({open:true});
	}
	
	onMouseOut=(e)=>{
		this.setState({open:false});
	}
	
	componentWillReceiveProps(nextProps){
		if (typeof nextProps.isOpen!='undefined' && nextProps.isOpen!=this.state.open){
			this.setState({open:nextProps.isOpen});
		}
	}
	        
	render() {
		const {label, type, large, small, className, width, height, children, isOpen, autoOpen, ...others}=this.props;
		const cls=Util.classNames('button',
			{ 
				green : (type==='green'|| type==='submit'),
				blue  : (type==='blue' || type==='important'),
				red   : (type==='red'  || type==='danger'),
				large : large,
				small : small,
			},
			className
		);
		const events={};
		
		if (autoOpen) {
			events.onMouseOver=this.onMouseOver;
			events.onMouseOut=this.onMouseOut;
		}else events.onClick=this.tagOpen;
		
		return (
			<div className={cls}
					ref={(el)=>{this.input_el = el}}
					{...events /* event handler  */}
					{...others /* passthrow prop */} 
				>
				{label}<Icon name='plus'/>
				{ !autoOpen && this.state.open && 
						<div 
							style={{position:'fixed', top:0, bottom:0, left:0, right:0, zIndex:10}} 
							onClick={this.tagOpen}
						/> 
				}
				{ this.state.open && 
					<div 
							className='modal' 
							onClick={(e)=>e.stopPropagation()} 
							onMouseOver={this.onMouseOver}
							style={{width : this.state.pull_width, height : this.state.pull_height, ...this.state.pos}}
						>
						{children}
					</div>
				}
			</div>
		) 
	}
}

export default PulldownButton;
