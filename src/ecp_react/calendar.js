import React from 'react';
import Icon from './icon';
import css from './calendar.module.css'

let range = (start, end) => Array.apply(null, {length: end - start + 1}).map((v, i) => i + start)

var language = {  
  "year"   : [["年"], [""]],  
  "months" : [
  	["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],  
    ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"]  
  ],  
  "weeks"  : [
  		["日","一","二","三","四","五","六"],  
      ["SUN","MON","TUR","WED","THU","FRI","SAT"]  
  ],  
  "clear"  : [["清空"], ["CLS"]],  
  "today"  : [["今天"], ["TODAY"]],  
  "close"  : [["关闭"], ["CLOSE"]]  
}

var cellRender=function(y, m, d) {
	if (d<=0) return '';
	return d;
}

class Calendar extends React.Component {

	static defaultProps = {
		lang     : 0,        /* chinese */
    yearBegin: 2020,
    yearEnd:   2030,
    dateCellRender: cellRender,
    onSelect: ()=>{},
    onPanelChange: ()=>{}
  }
  
  static propTypes = {
	}
	
	static _MD = [31,28,31,30,31,30,31,31,30,31,30,31];
  
  
  constructor(props) {
  	super(props);
  	this.state=this.getInitState(props);
  }
  
  getInitState=(props)=>{
  	if (props.value) {
  		const [y, m, d]=props.value.split('-').map(o=>parseInt(o));
  		return {year:y, month:m-1, day:d, today: new Date(), value:props.value}
  	}
  	return {
  		year  : props.year  || new Date().getFullYear(),
  		month : props.month || new Date().getMonth(),
  		day   : props.day   || new Date().getDate(),
  		today : new Date()
  	}	
  }	
  
  /** Helper functions */
  getMonthDays = (month) => {
		const year=this.state.year;
		if (!month) month = this.state.month;
		
		if (((0 === (year%4)) && ( (0 !== (year%100)) || (0 === (year%400)))) && month === 1) {
			return 29;
		} else {
			return Calendar._MD[month];
		}
	}
	
	preMonth=(e)=>{
		let {month,year}=this.state;
		if (month===0 && year===this.props.yearBegin) return;
		if (month===0) { month=11; year--;}
		else month--;
		this.props.onPanelChange(year,month);
		this.setState({year, month})
	}
	
	nextMonth=(e)=>{
		let {month,year}=this.state;
		if (month===11 && year===this.props.yearEnd) return;
		if (month===11) {month=0; year++}
		else month++;
		this.props.onPanelChange(year,month);
		this.setState({year, month})
	}
	
	preYear=(e)=>{
		let year=this.state.year;
		if (year>this.props.yearBegin) year--;
		else return;
		this.props.onPanelChange(this.state.month, year);
		this.setState({year})
	}
	
	nextYear=(e)=>{
		let year=this.state.year;
		if (year<this.props.yearEnd) year++;
		else return;
		this.props.onPanelChange(this.state.month, year);
		this.setState({year})
	}
	

  yearChange =(e)=>{
		let year=parseInt(e.target.value);
		this.props.onPanelChange(year,this.state.month);
		this.setState({year})
  }
  
  monthChange =(e)=>{
		let month=parseInt(e.target.value);
		this.props.onPanelChange(this.state.year, month);
		this.setState({month});
	}
		
  showDate=(offset, l, i)=>{
  	
  	let year=this.state.year;  	
  	let month=this.state.month;
  	let day=l*7+i-offset+1;
  	let cls=''
  	
  	if (i===0)  cls=css.week_end0;
		else if (i===6) cls=css.week_end6;

  	if (year===this.state.today.getFullYear() &&
		month===this.state.today.getMonth()  &&
		day===this.state.today.getDate()) cls+=' '+css.today;

	if (day===this.state.day) cls+=' '+css.sel;

	if (day<=0) {
		year=(month>0)?year:year-1;
		month=(month>0)?month-1:11;
		day+=this.getMonthDays(month);
		cls +=' last-month';
	}else if (day>this.getMonthDays()) {
		year=(month===11)?year+1:year;
		month=(month===11)?0:month+1;
		day-=this.getMonthDays(this.state.month);
		cls +=' '+ css['next-month'];
	}
  	
  	return (
  		<td key={i} className={`${css.content} ${cls}`} 	
  			onClick={e=>this.onSelect(year, month, day)}
  		>
  			{this.props.dateCellRender(year, month, day)}
  		</td>
  	)
  }

  showHeader=(i)=>{
	let cls=''
  	if (i===0)  cls=css.week_end0;
		else if (i===6) cls=css.week_end6;
		return <th key={i} className={`${css.header} ${cls}`}>{language.weeks[this.props.lang][i]}</th>
	}
	
	onSelect=(y,m,d)=>{
		this.props.onSelect(y,m,d);
		this.setState({day:d});
	}
	
	componentWillReceiveProps(nextProps){
		if (	(typeof nextProps.value!=='undefined' && nextProps.value!==this.state.value) ||
			this.props.month!==nextProps.month ||
			this.props.year!==nextProps.year ||
			this.props.day!==nextProps.day ) this.setState(this.getInitState(nextProps));
	}
	
  render() {
  	
  	let d=new Date(this.state.year, this.state.month, 1);
  	let weekday=d.getDay();
  	
  	return (
  		<div>
  			{ this.props.toolbar &&
					<table className={css['min-bar']}>
						<tbody>
						<tr>
							<th>
								<span onClick={this.preYear}><Icon name='backward'/></span>
							</th><th>
								<span onClick={this.preMonth}><Icon name='chevron-left'/></span>
							</th>
							<th className={css.large}>
								<select value={this.state.year} onChange={this.yearChange}>
								{
									range(this.props.yearBegin, this.props.yearEnd)
										.map(i=><option key={i} value={i}>{i+language['year'][this.props.lang]}</option>)
								}
								</select>
							</th>
							<th className={css.large}>	
								<select style={{fontSize:12,margin:0, padding:0 }} value={this.state.month} onChange={this.monthChange}>
								{
										range(0,11).map(i=><option key={i} value={i}>{language['months'][this.props.lang][i]}</option>)
								}
								</select>
							</th>
							<th>
								<span onClick={this.nextMonth}><Icon name='chevron-right'/></span>
							</th><th>	
								<span onClick={this.nextYear}><Icon name='forward'/></span>
							</th>
						</tr></tbody>
					</table>
				}
  			<table className={css.min}>
  				<tbody>
						<tr>
						{ range(0,6).map(this.showHeader)}
						</tr>
						{ range(0,5).map(l=><tr key={l} style={{textAlign:"center"}}>{range(0,6).map((i)=>this.showDate(weekday, l, i))}</tr>)}
					</tbody>	
  			</table>
  		</div>
  	)
  }
}

export default Calendar;
