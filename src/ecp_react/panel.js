import React from 'react';
import ReactDOM from 'react-dom';
import Table from './table.js';
import GForm from './form.js';
import Util from './util.js';
import './panel.css';

function Footer(props) {
	return <div className='panel-footer'>{props.children}</div>	;
}

function Panel(props) {
	const {className, title, children, ...others}=props;
	const cls=Util.classNames('panel', className);
	let body;
	let footer;
	if (!(props.children instanceof Array)) {
		
		if (props.children && (props.children.type==Table || props.children.type==GForm)) {
			body=props.children;
		}else{
			body=<div className='panel-body'>{props.children}</div>;
		}
	}else {
		if (props.children[0].type==Table || props.children[0].type==GForm) {
			body=props.children[0];
			footer=<Footer>{props.children.slice(1)}</Footer>;
		}else{	
			if (props.children[props.children.length-1].type==Footer) {
				body=<div className='panel-body'>{props.children.slice(0, props.children.length-1)}</div>
				footer=props.children[props.children.length-1];
			}else{
				body=<div className='panel-body'>{props.children}</div>
			}	
	 	}
	}
	
	return (
		<div className={cls} {...others}>
			<div className='panel-heading' >
				<span className='panel-title'>{title}</span>
				<span className='pannel-btns' style={{float:'right'}}>{props.buttons}</span>
			</div>
			{body}
			{footer}
		</div>
	);
}


Panel.Footer=Footer
export { Panel as default , Panel, Footer }
