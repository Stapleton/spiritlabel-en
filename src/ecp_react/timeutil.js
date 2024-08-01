/* 转换日期/时间到Date类*/
function parse(str) {
	if (!str) return null;
	let m=str.match(/^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/);
	if (m) return new Date(m[1], m[2]-1, m[3], m[4], m[5], m[6]);
	
	m=str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
	if (m) return new Date(m[1], m[2]-1, m[3]);

	return null;
}

/*时间转换为秒数*/	
function parseTime(str) {	
	const m=str.match(/^(\d{2}):(\d{2}):(\d{2})$/);
	if (m) return parseInt(m[1])*3600+parseInt(m[2])*60+parseInt(m[3]);
	return 0;
}

/* foramt timestamp */
function timestamp2str(time) {
	var datetime = new Date();
	datetime.setTime(time*1000);
	var year = datetime.getFullYear();
	var month = datetime.getMonth() + 1;
	var date = datetime.getDate();
	var hour = datetime.getHours();
	var minute = datetime.getMinutes();
	var second = datetime.getSeconds();
	//var mseconds = datetime.getMilliseconds();
	return year + "-" + month + "-" + date+" "+hour+":"+minute+":"+second; //+"."+mseconds;
}

const TimeUtil={parse, parseTime};
export { TimeUtil as default, parseTime, timestamp2str}
	
