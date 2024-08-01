import React from 'react';

function openPage(url, title, icon, singleton) {
	let M;
	if (!title) title='新页面';
	if (!window.Main) M=parent.Main;
	else M=Main;
	singleton=(typeof singleton=='undefined')?true:singleton;
	const p={tabname:title, type:'app', uuid:url, url:url, iframe:true, singleton:singleton};
	if (icon) p.icon=icon;
	M.createPage(p);
}

export default function PageLink(props) {
	const { href, title, icon, singleton, children, others}=props;
	return <a onClick={(e)=>openPage(href, title, icon, singleton)} {...others}>{children}</a>
}

