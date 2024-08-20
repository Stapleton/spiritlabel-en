import React from 'react';
import Icon from './icon.js';
import Util from './util.js';
import css from './button.module.scss';

export default function Button(props) {
	const {type, className, large, small, onClick, icon, icon_group, icon_class, children, ...others}=props;
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
	return  (
		<a className={cls} onClick={onClick} {...others}>
			{icon && <Icon name={icon} group={icon_group} className={icon_class}/> }
			{children}
		</a>
	);
}
