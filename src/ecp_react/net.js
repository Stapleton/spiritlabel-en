/* JSON to PHP url */
var serialize = function(obj, prefix) {
	var str = [];
	for(var p in obj) {
		if (obj.hasOwnProperty(p)) {
			var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
			str.push(typeof v == "object" ?
				serialize(v, k) :
				encodeURIComponent(k) + "=" + encodeURIComponent(v));
		}
	}
	return str.join("&");
}

export function  get(url, data) {
	return new Promise((resolved, reject)=>{
		if (data) url+=(url.indexOf('?')>0?'&':'?')+serialize(data)
		fetch(url, {
			method: "GET", 
			headers: {'X-Requested-With':'ReactRequest'}
		}).then((res)=>res.json()).then(
			(rc)=>{ 
				if (rc.rc==='ok' || rc.rc==='OK') resolved(rc); 
				else reject(rc.errmsg||rc.msg||rc.result_msg); 
			}
		).catch((err)=>reject(err));
	})	
}

export function post(url, data, fmt) {
	return new Promise((resolved, reject)=>{
		let isJson = fmt !== 'FORM';
		fetch(url, {
			method: "POST", 
			credentials: "include",
			headers: {
				'content-type': isJson?'application/json':'application/x-www-form-urlencoded',
				'X-Requested-With':'XMLHttpRequest'
			},
			body: isJson?JSON.stringify(data) : serialize(data)
		}).then((res)=>res.json()).then(
			(rc)=>{ 
				if (rc.rc==='ok' || rc.rc==='OK') resolved(rc); 
				else reject(rc.errmsg||rc.msg||rc.result_msg); 
			}
		).catch((err)=>{ if (typeof reject=='function') reject(err); else alert(err) });
	})	
}

var exp={get, post} 
export default exp
