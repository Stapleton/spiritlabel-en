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
					if (vars.indexOf(token[0])<0) vars.push(token[0])
				}
			}
		}
	})
	return vars;
}
const exp = { get_vars  }
export default exp
