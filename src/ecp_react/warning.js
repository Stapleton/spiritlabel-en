import React from 'react';
import Icon from './icon.js';
import {classNames} from './util.js'
import css from './warning.module.css'

const Info=props=>(
<div
	className={classNames(css.info, props.className, {[css.small]:props.small})}	
><Icon className={css.icon} name="info-sign"/>{props.children}</div>)

const Warning=props=>(
<div
	className={classNames(css.warning, props.className, {[css.small]:props.small})}	
><Icon className={css.icon} name="info-sign"/>{props.children}</div>)

const Error=props=>(
<div
	className={classNames(css.error, props.className,  {[css.small]:props.small})}	
><Icon className={css.icon} name="info-sign"/>{props.children}</div>)


export {Info, Warning, Error}



