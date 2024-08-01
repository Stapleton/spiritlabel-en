
/* 加载JS*/
export const loadjs = function(jsfile, checkerr) {
	return new Promise((resolve, reject)=>{
		const win=window;
		const oHead = win.document.getElementsByTagName('HEAD').item(0);
		const scripts=oHead.getElementsByTagName('script');
		const jsfile_path=win.location.protocol+'//'+win.location.host+jsfile;
		for(var i=0; i<scripts.length; i++){
			if (scripts[i].src===jsfile_path) {
				resolve();
				return;
			}
		}
		var oScript= win.document.createElement("script");
		oScript.type = "text/javascript";
		oScript.src=jsfile;
		oScript.onload = ()=>{
			resolve();
		}
		if (checkerr) oScript.onerror = ()=>{
			reject();
		}
		oHead.appendChild(oScript);
	});
}

/* 加载CSS */
export  const loadcss=function(cssfile,callback) {
	const win=window;
	const oHead = win.document.getElementsByTagName('HEAD').item(0);
	const links=oHead.getElementsByTagName('link');
	let cssfile_path=win.location.protocol+'//'+win.location.host+cssfile;
	for(var i=0; i<links.length; i++){
		if (links[i].href===cssfile_path) {if (typeof callback === 'function') callback(); return ;}
	}
	const oScript= win.document.createElement("link");
	oScript.type = "text/css";
	oScript.rel = "stylesheet";
	oScript.href=cssfile;
	oHead.appendChild(oScript);
	if (typeof callback == 'function') callback();
	return;
}

/* 返回element的位置*/
export function getAbsolutePos (el) {
	var r = { x: el.offsetLeft - el.scrollLeft, y: el.offsetTop - el.scrollTop};
	if (el.offsetParent) {
		var tmp = getAbsolutePos(el.offsetParent);
		r.x += tmp.x;
		r.y += tmp.y;
	}
	return r;
}

/* 返回弹出窗口的位置*/
export function getPopPos(el, width, height) {
	const p=getAbsolutePos(el);
	const pos={};
	
	if (p.x + width > window.innerWidth)
		pos.left=p.x - width;
	else pos.left=p.x;
		
	if (p.y + el.offsetHeight + height > window.innerHeight)
		pos.top=p.y - height;
	else pos.top=p.y + el.offsetHeight;
	
	return pos;
}	


/**
 * 创建element
 */
export const el = function(type, style, attr, doc){
	if (!doc) doc=document;
	var e=doc.createElement(type);
	if (style) for(let p in style) e.style[p]=style[p];
	if (attr) for(let a in attr) {
		if (a==='className') e.className=attr[a];
		else if (a==='innerHTML') e.innerHTML=attr[a];
		else e.setAttribute(a, attr[a]);
	}	
	return e;
}

export const hasClass=function(obj, cName) {
	return (!obj || !obj.className)?false:(new RegExp("\\b"+cName+"\\b")).test(obj.className);
}

export const appendClass=function(obj,cName) {
	removeClass(obj,cName); 
	return obj && (obj.className+=(obj.className.length>0?' ':'')+cName);
}

export const removeClass=function(obj, cName){
	var arr=obj.className.split(' ');
	for(var i=0;i<arr.length;i++) { 
		if(arr[i]===cName) { arr.splice(i,1);break;}
	}
	obj.className=arr.join(' ');
}

/**
 * 拖动DIV
 * 一般在obj.onmousedown处理程序中调用该函数，然后obj可以被鼠标拖动。
 * 对于正确的拖动会调用cb2函数，释放鼠标后调用callback函数
 */
export const fDragging =function(obj, e, limit, callback, cb2) {
	if  (!e) e=window.event;
	var op  = obj.parentNode;
	var opX = op.offsetLeft;   
	var opY = op.offsetTop;    
	var x=parseInt(obj.style.left);
	if(isNaN(x)) x = parseInt(obj.style.right);
	var y=parseInt(obj.style.top);
	
	var x_=e.clientX-x;
	var y_=e.clientY-y;

	if(document.addEventListener){
		document.addEventListener('mousemove', inFmove, true);
		document.addEventListener('mouseup', inFup, true);
	} else if(document.attachEvent){
		document.attachEvent('onmousemove', inFmove);
		document.attachEvent('onmouseup', inFup);
	}

	inFstop(e);
	inFabort(e);

	function inFmove(e) {
		var valid_move=false;
		if(!e) e=window.event;

		if(limit){
			if((e.clientX-x_)>=opX && (e.clientX-x_+obj.offsetWidth+opX)<=(opX+op.offsetWidth)) {
				 obj.style.left=e.clientX-x_+'px';
				 valid_move=true;
			}
			
			if(e.clientY-y_>=opY && (e.clientY-y_+obj.offsetHeight+opY)<=(opY+op.offsetHeight)) { 
				obj.style.top=e.clientY-y_+'px';
				valid_move=true;
			}	
		}else{
			if(e.clientX>=opX && e.clientX <=op.offsetWidth) {
				obj.style.left=e.clientX-x_+'px';
				valid_move=true;
			}if(e.clientY>=opY && e.clientY<=op.offsetHeight)	{
				obj.style.top=e.clientY-y_+'px';
				valid_move=true;
			}	
		}
		var ev=e;
		inFstop(e);
		if (valid_move && typeof cb2=='function') cb2(ev);
	}

	function inFup(e){
		if(!e) e=window.event;
		if(document.removeEventListener){
			document.removeEventListener('mousemove', inFmove, true);
			document.removeEventListener('mouseup', inFup, true);
		} else if(document.detachEvent){
			document.detachEvent('onmousemove', inFmove);
			document.detachEvent('onmouseup', inFup);
		}
		var ev=e;
		inFstop(e);
		if (typeof callback == 'function') callback(ev);
	} 

	function inFstop(e){
		if(e.stopPropagation) return e.stopPropagation();
		else return e.cancelBubble=true;
	}

	function inFabort(e){
		if(e.preventDefault) return e.preventDefault();
		else return e.returnValue=false;
	}
}
