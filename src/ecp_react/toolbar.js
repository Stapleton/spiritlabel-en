import React from 'react';
import Util from './util.js';
import css from './toolbar.module.scss'

function Group(props) {
	const {className, children, ...others}=props;
	const cls=Util.classNames(css['com-tb-item'], className);
	return <div className={cls} {...others}>{props.children}</div>;
}

function Title(props) {
	const {className, children, ...others}=props;
	const cls=Util.classNames(css['com-tb-item'], className);
	return <div className={cls} {...others} ><span className={css.title}>{children}</span></div>;
}

function Toolbar(props) {
	const {className, ...others}=props;	
	const cls=Util.classNames(css['com-toolbar'], className);
	let key=0;
	return  (
		<div className={cls} {...others}>
			{ React.Children.map(props.children,  o=>{
					if (!o) return o;
					if (o.type===Group || o.type===Ext || o.type===Title) return o;
					else return <Group key={key++}>{o}</Group>;
				})
			}
		</div>	
	);
}

function Ext(props) {
	const {className, ...others}=props;	
	const cls=Util.classNames(css['com-toolbar-ext'], className);
	let key=0;
	return  (
		<div className={cls} {...others}>
			{ React.Children.map(props.children, o=>{
					if (!o) return o;
					if (o.type===Group || o.type===Ext || o.type===Title) return o;
					else return <Group key={key++}>{o}</Group>;
				})
			}
		</div>	
	);
}

Toolbar.Group=Group;
Toolbar.Title=Title;
Toolbar.Ext=Ext;

export {Toolbar as default, Toolbar, Group, Title, Ext}
