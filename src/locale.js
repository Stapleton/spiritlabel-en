import strings from "./translate.js"

var lang = navigator.language || navigator.userLanguage;

if (lang==="zh" || lang.substring(0,3)==="zh-") lang="zh";
else lang="en";

export const setLanguage=function(l) {
	/* 目前只支持中文和英文，且缺省为英文*/
	if (l!=="zh") lang="en";
	else lang=l;
}

export const _ = function(strid) {
	if (strid in strings) {
		if (lang in strings[strid]) return strings[strid][lang];
		if ("zh" in strings[strid]) return strings[strid]["zh"];
	}
	return strid;
}


