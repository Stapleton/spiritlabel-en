import React from 'react';
import ReactDOM from 'react-dom';
import Toolbar from './toolbar.js';
import {classNames} from './util.js';
import {el, fDragging } from './gaf/utils.js';

import './layout.css'

function Left(props) {
	let style=props.style || {}
	if (typeof props.size!='undefined') style.width=props.size; 
	return  (
		<div ref={props.setRef}	style={style}
			className={`er-layout-left${props.singleBorder?' single-border':''}`} >
			{props.children}
		</div>
	);
}

function Right(props) {
	let style=props.style || {}
	if (typeof props.size!='undefined') style.left=props.size; 
	return  (
		<div ref={props.setRef} className='er-layout-right' style={style}>
			{props.children}
		</div>
	);
}

function Upper(props) {
	let style=props.style || {}
	if (typeof props.size!='undefined') style.height=props.size; 
	return  (
		<div ref={props.setRef} style={style}
			className={`er-layout-upper${props.singleBorder?' single-border':''}`} >
			{props.children}
		</div>
	);
}

function Down(props) {
	let style=props.style || {}
	if (typeof props.size!='undefined') style.top=props.size; 
	return  (
		<div ref={props.setRef} style={style} className='er-layout-down'>
			{props.children}
		</div>
	);
}

function Pan(props){
	const {type, className, children, setRef, ...others}=props;
	const cls=classNames(
		{
			'er-layout-pan-top':type==='top',
			'er-layout-pan-bottom':type==='bottom'
		}, className);
	return <div className={cls} ref={setRef} {...others}>{children}</div>;
}

class Layout extends React.Component {
	
	static defaultProps = {
		root : false,
		singleBorder: false, 
		fixSize: false, 
	};

	componentDidMount() {
		if (this.panTop) this.parent.style.top=this.panTop.offsetHeight+'px';
		if (this.props.fixSize) return;
		
		let is_ud = (this.props.children[0].type==Upper || this.props.children[1].type==Upper);
		
		let left, right;
		if (this.props.children.length==3) {
			left=this.props.children[1];
			right=this.props.children[2];
		}else{
			left=this.props.children[0];
			right=this.props.children[1];
		}
		
		if (this.spliter) {
			if (is_ud) this.spliter.style.top=(this.pan1.offsetHeight-1)+'px'
			else  this.spliter.style.left=(this.pan1.offsetWidth-1)+'px'
			
			this.spliter.onmousedown=function(ev) {
				var drag_mask=el('div', {top:0,left:0,bottom:0, right:0, position:'absolute'});
				document.body.appendChild(drag_mask); /*加入透明层防止iframe影响拖动速度*/
				
				var store=0;
				
				fDragging(this.spliter, ev, true, function() {
					var p=0;
					
					if  (is_ud) {
						var new_p=parseInt(this.spliter.style.top);
						if (new_p==this.pan1.offsetHeight) {
							if (new_p==0) p=store;
							else { p=0; store=new_p;}
						}else p=new_p;
						
						this.pan1.style.height = (p+1)+'px';
						this.pan2.style.top = (p+1)+'px';
						this.spliter.style.top = p+'px';
					}else{
						var new_p=parseInt(this.spliter.style.left);
						if (new_p==this.pan1.offsetWidth) {
							if (new_p==0) p=store;
							else { p=0; store=new_p;}
						}else p=new_p;
						
						this.pan1.style.width = (p+1)+'px';
						this.pan2.style.left= (p+1)+'px';
						this.spliter.style.left = p+'px';
					}
					document.body.removeChild(drag_mask);
				
					/* if set onResize props on Left/Right (Upper/Down) call it */
					if (left.props.onResize) {
						left.props.onResize(this.pan1.offsetWidth,this.pan1.offsetHeight);
					}
						
					if (right.props.onResize) {
						right.props.onResize(this.pan2.offsetWidth,this.pan2.offsetHeight);
					}
				}.bind(this))
			}.bind(this)
		}		
 	}
 	
 	componentDidUpdate() {
	 	if (this.panTop) this.parent.style.top=this.panTop.offsetHeight+'px';
		if (this.props.fixSize) return;
		
 		let is_ud = (this.props.children[0].type==Upper || this.props.children[1].type==Upper);
 		if (this.spliter) {
			if (is_ud) this.spliter.style.top=(this.pan1.offsetHeight-1)+'px'
			else  this.spliter.style.left=(this.pan1.offsetWidth-1)+'px'
		}
 	}
	
	setPan1=(el)=>{
		this.pan1=el;
	}
	
	setPan2=(el)=>{
		this.pan2=el;
	}
	
	setPanTop=(el)=>{
		this.panTop=el;
	}

	render() {
		let topPan, left, right;
		if (this.props.children.length==3) {
			topPan=this.props.children[0];
			left=this.props.children[1];
			right=this.props.children[2];
		}else{
			left=this.props.children[0];
			right=this.props.children[1];
		}
		
		var sp_class;
		var sp_style;
		let layout_ud = this.props.children[0].type==Upper || this.props.children[1].type==Upper
		
		var sp_class = classNames({
			'er-layout-ud-spliter' : layout_ud, 
			'er-layout-lr-spliter' : !layout_ud, 
			'single-border' : this.props.singleBorder
		})
				
		let stl={position:'absolute', top:0, left:0, right:0, bottom: 0};
		
		let size=left.props.size?left.props.size: (right.props.size?`calc(100% - ${right.props.size}px)`:undefined);
							
		const {singleBorder, root, style, fixSize, ...other}=this.props;
		
		if (topPan) {
			return  (
				<div style={{...style, ...stl}} {...other}>
					{topPan.type==Pan ? 
						React.cloneElement(topPan, {setRef:this.setPanTop, type:'top'}):
						<Pan setRef={this.setPanTop} type='top'>{topPan}</Pan>
					}
					<div ref={el=>this.parent = el}  style={stl} >
						{React.cloneElement(left, {singleBorder: this.props.singleBorder, setRef:this.setPan1, size:size})}
						{React.cloneElement(right,	{singleBorder: this.props.singleBorder, setRef:this.setPan2, size:size})}	
						<div className={sp_class} ref={el=>this.spliter=el}/>
					</div>	
				</div>	
			);	
		}else
			return  (
				<div ref={el=>this.parent = el} style={{...style, ...stl}} {...other}>
					{React.cloneElement(left, {singleBorder: this.props.singleBorder, setRef:this.setPan1, size:size})}
					{React.cloneElement(right, {singleBorder: this.props.singleBorder, setRef:this.setPan2, size:size})}
					<div className={sp_class} ref={el=>this.spliter=el}/>
				</div>	
			);
	}	
}

Layout.Left=Left;
Layout.Right=Right;
Layout.Upper=Upper;
Layout.Down=Down;
Layout.Pan=Pan; 

export {Layout as default, Layout, Left, Right, Upper, Down, Pan}

