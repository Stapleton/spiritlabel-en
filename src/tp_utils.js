const sTag="{{";
const eTag="}}";

export function get_vars(tp) {
	let vars=[];
	tp.forEach((o)=>{
		if (o.cmd==='Group') {
			get_vars(o.data.items).forEach(v=>{
				if (vars.indexOf(v)<0) vars.push(v)
			})
		}
		if (o.data.tp) {
			var tokens = o.data.tp.split(sTag);
			for (var i = 0, len = tokens.length; i < len; i++) {
				var token = tokens[i].split(eTag);
				if (token.length === 2) {
				    const vn=token[0].trim().substring(1)
					if (vars.indexOf(vn)<0) vars.push(vn)
				}
			}
		}
	})
	return vars.sort();
}
const exp = { get_vars  }
export default exp
