import React from 'react';
import Util from './util.js';
import css from './page.module.scss';

const Page=function(props) {
	const {className, width, style, children, ...others}=props;
	let cls=Util.classNames(css.container,	className);
	return  (
		<div className={cls} style={{...style, width:width}} {...others}>
			{children}
		</div>
	);
}

const H1=function(props) {
	const {className, children, style, ...others}=props;
	let cls=Util.classNames(css.h1,	className);
	return  (
		<div className={cls} style={style} {...others}>
			{children}
		</div>
	);
}

const H2=function(props) {
	const {className, children,  style, ...others}=props;
	let cls=Util.classNames(css.h2,	className);
	return  (
		<div className={cls} style={style} {...others}>
			{children}
		</div>
	);
}

const H3=function(props) {
	const {className, children, style, ...others}=props;
	let cls=Util.classNames(css.h3,	className);
	return  (
		<div className={cls} style={style} {...others}>
			{children}
		</div>
	);
}

const H4=function(props) {
	const {className, children, style, ...others}=props;
	let cls=Util.classNames(css.h4,	className);
	return  (
		<div className={cls} style={style} {...others}>
			{children}
		</div>
	);
}

const H5=function(props) {
	const {className, children, style, ...others}=props;
	let cls=Util.classNames(css.h5,	className);
	return  (
		<div className={cls} style={style} {...others}>
			{children}
		</div>
	);
}

const H6=function(props) {
	const {className, children, style, ...others}=props;
	let cls=Util.classNames(css.h6,	className);
	return  (
		<div className={cls} style={style} {...others} >
			{children}
		</div>
	);
}


export {Page as default, Page, H1, H2, H3, H4, H5, H6}

