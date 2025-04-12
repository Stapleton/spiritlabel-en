import React from 'react';
import Icon from './icon.js';
import Util from './util.js';
import css from './button.module.scss';

export default function Button(props) {
	const {disable, type, className, large, small, onClick, icon, icon_group, children, ...others}=props;
	const cls=Util.classNames(
		{ 
			[css.button] : type!=='inline',
			[css.table]  : type==='table',
			[css.green]  : (type==='green'|| type==='submit'),
			[css.blue]   : (type==='blue' || type==='important'),
			[css.red]    : (type==='red'  || type==='danger'),
			[css.large]  : large,
			[css.small]  : small,
		},
		className
	);
	
    const onBtnClick=(e)=>{
       e.stopPropagation()
       if (!disable && onClick) onClick();
    }
	
	return  (
		<a className={cls} onClick={onBtnClick} {...others}>
			{icon && <Icon name={icon} group={icon_group}/> }
			{children}
		</a>
	);
}

