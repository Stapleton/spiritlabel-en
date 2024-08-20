import React from 'react';
import ReactDOM from 'react-dom';
import Button from './button.js';
import Icon from './icon.js';
import GForm from './form.js';
import divWin from './gaf/divwin.js';
import {classNames} from './util.js';

import css from './divwin.module.css';
import btncss from './button.module.scss'

function getProps(msg, def) {
	let height = def.height || 200;
	let width  = def.width  || 400;
	let title  = def.title  || '警告';
	let type   = def.type   || 'info';
	
	if (typeof msg!=='string') {
		height=msg.props.height || height;
		width=msg.props.width || width;
		title=msg.props.title || title ;
		type=msg.props.type  || type;
	}
	return {height, width, title, type}
}	

const TypeIcon={
	'I': {name:'info-sign', color:'#38a92b'},
	'W': {name:'exclamation-sign', color:'#ff9627'},
	'Q': {name:'question-sign', color:'#5478e0'},
	'E': {name:'minus-sign', color:'#ff3100'},
}
const long2short={
	'info': 'I',
	'warning': 'W',
	'confirm': 'Q',
	'error': 'E'
}

function getTypeIcon(type) {
	let t=long2short[type]?long2short[type]:'I';
	return TypeIcon[t];
}

class DivWin {
	
	static show=(dlg)=> {
		const w=new DivWin();
		w.doShow(dlg)
		return w;
	}
	
	static alert=(msg, msgtype, finish)=> {
		
		const w=new DivWin();
		
		//msg = '' + msg;
			
		if (typeof msgtype=='function') {
			finish=msgtype;
			msgtype='info';
		}
		const {type, ...others}=getProps(msg, {type:msgtype});
		
		if (typeof msg=='string') msg=msg.split('\n').map((s,i)=><p key={i}>{s}</p>);
		const dlg=
			<Form 
				onSubmit={()=>{
					w.close();
					if (finish) finish();
				}}					
				{...others}
				>
				<div className={css.alert}>
					<div className={css.['alert-icon']}><Icon {...getTypeIcon(type)}/></div>
					<div className={css.['alert-ctx']}>{msg}</div>
				</div>
			</Form>;
		
		w.doShow(dlg)
		return w;
	}
	
	static confirm=(msg, cont, cancel)=> {
		const w=new DivWin();
		const {type, ...others}=getProps(msg, {type:'confirm'});
		if (typeof msg=='string') msg=msg.split('\n').map(s=><p>{s}</p>);
		const dlg=
			<Form 
					onSubmit={()=>{
						w.close();
						if (cont) cont();
					}} 
					btn_OK='是'
					btns={[<Button key={1} onClick={()=>{ w.close(); if (cancel) cancel()}}>否</Button>]}
					{...others}
				>
				<div className={css.alert}>
					<div className={css.['alert-icon']}><Icon {...getTypeIcon(type)}/></div>
					<div className={css.['alert-ctx']}>{msg}</div>
				</div>
			</Form>;
		
		w.doShow(dlg)
		return w;
	}
	
	static prompt=(msg, init, cb, cancel)=> {
		const w=new DivWin();
		const {type, ...others}=getProps('', {title:msg});
		if (typeof msg=='string') msg=msg.split('\n').map(s=><p>{s}</p>);
		const dlg=
			<Form 
					onSubmit={()=>{
						w.close();
					}} 
					btn_OK='是'
					btns={[<Button key={1} onClick={()=>{ w.close(); if (cancel) cancel()}}>否</Button>]}
					{...others}
				>
				<div className={css.alert}>
					<div className={css.['alert-icon']}><Icon {...getTypeIcon(type)}/></div>
					<div className={css.['alert-ctx']}>{msg}</div>
				</div>
			</Form>;
		
		w.doShow(dlg)
		return w;
	}
	
	
	close=()=>{
		this.w.close();
	}
	
	onClose=()=>{
		this.reactRoot.map((r)=>ReactDOM.unmountComponentAtNode(r));
		return true;
	}
	
	getValues=()=>{
		return this.form.getValues();
	}
	
	refresh=()=>{
		this.showbody(this.w, this.dlg);
	}
	
	doShow=(dlg) =>{
		
		let wid='W'+Math.floor((1 + Math.random()) * 0x10000);
		const props = dlg.props;
		const title = props.title || '对话框';
		const width = props.width || 400;
		const height= props.height || 300;
		const atTop = props.atTop || false;
		const skin  = props.skin || 'default';
		const w=new divWin(wid, {title, width, height, skin, atTop});
		w.onClose=this.onClose;
		this.w=w;
		this.dlg=dlg;
		this.reactRoot=[];
		
		this.showbody(w, dlg);
	}

	showbody=(w, dlg)=>{
		const props = dlg.props;
		
		if (dlg.type===Dialog) {
			this.reactRoot.push(w.body);
			ReactDOM.render(<div className={css.dialog}>{React.cloneElement(dlg, {dialog:this})}</div>,  w.body);
		}else if (dlg.type===Form) {
			let h=w.body.offsetHeight- 40 - w.skin_padding_footer;
			let cls=dlg.props.className;
			w.body.innerHTML=`
<div id="${w.myobj}-formbody" class="${classNames(css.form, cls)}" style="height:${h}px;overflow:auto;position:relative">
</div>
<div id="${w.myobj}-fbtns" class="${css.footer}">
	<div style="float:left" id="${w.myobj}-footerinfo"></div>
</div>`;
			let {btn_OK, btn_CANCEL, btns}=props;
			
			if (btn_OK!==false) {
				if (typeof btn_OK=='undefined') btn_OK="确定";
				var btnOK=w.topWin.document.createElement("a");
				btnOK.className=`${btncss.button} ${btncss.submit}`;
				btnOK.innerHTML= btn_OK;
				w.$(w.myobj+'-fbtns').appendChild(btnOK);
				btnOK.onclick=()=>{ 
					if (this.gform && !this.gform.isValid()) { 
					    /* GFrom类型的表单, 检查输入格式 */
						DivWin.alert(<div><div>表单填写错误:</div>{this.gform.getErrorString().map((e,i)=><p key={i}>{e}</p>)}</div>);
						return;
					}
					if (dlg.props.onSubmit) dlg.props.onSubmit(this, this.form?this.form.getValues():null);
					else {console.warn('no onSumbit function'); w.close();};
				}; 
			}
			
			if (btn_CANCEL) {
				var btnCancel=w.topWin.document.createElement("a");
				btnCancel.innerHTML=btn_CANCEL===true?'取消':btn_CANCEL;
				btnCancel.className=btncss.button;
				w.$(w.myobj+'-fbtns').appendChild(btnCancel);
				btnCancel.onclick=()=>{w.close()};			
			}			
			
			/*for( var bt in btns) {
				if (typeof btns[bt] == 'function') continue;
				if (typeof btns[bt] != 'object') continue;
				var btnTmp=w.topWin.document.createElement("a");
				btnTmp.innerHTML=btns[bt].name;
				btnTmp.className="button "+(!btns[bt].className?'':btns[bt].className);
				btnTmp.setAttribute('title', btns[bt].hint?btns[bt].hint:btns[bt].name);
				if (typeof btns[bt].onClick =='function') 
					btnTmp.onclick=btns[bt].onClick.bind(this);
				w.$(w.myobj+'-fbtns').appendChild(btnTmp);
			}*/		
			this.reactRoot.push(w.$(w.myobj+'-formbody'));
			ReactDOM.render(React.cloneElement(dlg, {dialog:this}), w.$(w.myobj+'-formbody'));
			
			if (btns){
				var btns_container=w.topWin.document.createElement("span");
				w.$(w.myobj+'-fbtns').appendChild(btns_container);
				this.reactRoot.push(btns_container);
				ReactDOM.render(<span>{btns.map((btn,i)=>{ 
					if (btn.type===Button) return React.cloneElement(btn, {key: i});
					return null;
				})}</span>, btns_container);
			}
			
		}else{
			/* Error */
			w.body.innerHTML='弹出窗口根节点类型必须是Dialog/Form';
		}
	}
}

function Dialog(props) {
	const {children, dialog}=props
	if (children instanceof Array) { 
		const child=children.map((c,i)=>(typeof c=='object' && typeof c.type!='string')?React.cloneElement(c, {dialog, key:i}):c);
		return <div style={{windth:'100%', height:'100%'}}>{child}</div>;
	}else{
		const child=(typeof children=='object' && typeof children.type!='string')?React.cloneElement(children, {dialog}) : children;
		return <div style={{windth:'100%', height:'100%'}}>{child}</div>;
	}
}

class Form extends React.Component {

	static defaultProps = {
		defaultValues : {}
	};

	state={
		values:this.props.values?this.props.values:this.props.defaultValues
	}
	
	onChange=(values, id, v)=>{
		if (this.props.onChange) this.props.onChange(values, id, v);
		this.setState({values});
	}
	
	getValues=()=>{
		return this.state.values;
	}
	
	render() {
		const {fields, readOnlyFields, nCol, dialog} = this.props;
		const {values}=this.state;
		
		if (!fields) return Dialog(this.props);
		/* 如果设置了fields， 表示是一个GForm类型的表单，自动创建一个child=>GForm。
		 * 将当前Form的实例(this)保存到DivWin(=props.dialog)的form字段中, GForm实例(通过ref获取)保存到DivWin的gform中
		 */
		dialog.form=this;
		return <GForm fields={fields} nCol={nCol} values={values} readOnlyFields={readOnlyFields}
			onChange={this.onChange} ref={ref=>dialog.gform=ref} border={false} />;
	}	
}

function Msg(props) {
	return Dialog(props);
}

DivWin.Dialog=Dialog;
DivWin.Form=Form;
DivWin.Msg=Msg;

export { DivWin as default,  DivWin, Dialog, Form, Msg };
