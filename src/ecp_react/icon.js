import React from 'react';
import Util from './util.js';
import './glyphicons.css';
import css from './icon.module.css';

export default class Icon extends React.Component {

	componentDidMount() {
		switch(this.props.group){
			case 'ecp':
				Util.loadcss('//at.alicdn.com/t/c/font_423244_rf1zm1vd7b.css');
				break;
		    default:
		        break;
		}		
	}
	
	render() {
		const {className, style, size, group, color, ...others} = this.props;
		let cls;
		switch (group) {
			case 'ecp':
				cls=Util.classNames("iconfont", "icon-"+this.props.name, {[css[`icon-size-${size}`]] : typeof size!='undefined'}, className);
				return(
					<i
						className={cls} 
						aria-hidden="true" 
						style={{...style, color:color}}
						{...others}
						/>
				);	
			default: 
				cls=Util.classNames("glyphicon", "glyphicon-"+this.props.name, {[css[`icon-size-${size}`]] : typeof size!='undefined'}, className);
				return(
					<span 
						className={cls} 
						aria-hidden="true" 
						style={{...style, color:color}}
						{...others}
						/>
				);	
		}
	}	
}

