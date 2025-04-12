import React from 'react';
import Util from './util.js';
import './glyphicons.css';
import css from './icon.module.css';

export default class Icon extends React.Component {
	
	render() {
		const {className, style, size, group, color, ...others} = this.props;
		let cls;
		switch (group) {
			case 'app':
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

