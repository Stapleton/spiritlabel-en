import React from 'react';
import ReactDOM from 'react-dom';
import Tree from './orgtree';
import Util from './util';
import './orginput.css';
import './modal.css';

class OrgInput extends React.PureComponent {
	
	static defaultProps = {
		value:{},
		showPerson:true
	}

	state={
		id   : this.props.value.id || null,
		name : this.props.value.name||'',
		open : false,
		pos  : null,
		pull_height : 300
	}
    
	tagOpen=()=>{
		if (this.props.readOnly) return;
		const pos=Util.getPopPos(this.input_el, this.state.pull_width, this.state.pull_height);
		this.setState((prevState, props) =>({open: !prevState.open, pos}));
	}    
	
	onSelect=(id, name)=>{
		this.setState({id, name, open:false});
		if (typeof this.props.onChange=='function') this.props.onChange(id,name);
	}
	
	componentDidMount() {
	  Util.loadcss("/gaf/css/glyphicons.css");         
	}
	
	componentDidUpdate(prevProps, prevState){
		if (prevProps.value!=this.props.value || prevProps.value.id!=this.props.value.id) {	
			const name=this.props.value.name ? this.props.value.name:''
			this.setState({id:this.props.value.id, name});
		}
	}
	        
	render() {
		const {className, style, width, onSelect, showPerson, ...others}=this.props;
		const cls=Util.classNames('org-picker', {'person':showPerson}, className );
		return (
			<div className={cls} style={style}>
				<input 
					ref={(el)=>{this.input_el = el; if (el) this.state.pull_width=width?width:el.offsetWidth}}
					value={this.state.name} 
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
						<div className='modal' style={{width : this.state.pull_width, height : this.state.pull_height, ...this.state.pos}}>
							<Tree showPerson={showPerson} {...others} onSelect={this.onSelect}/>
						</div> 
				}   
			</div>
		) 
	}
}

export default OrgInput;
