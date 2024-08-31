import React from 'react';
import css from "./stepper.module.css";
import {classNames} from "./util.js"

export function Step(props) {
    let title = typeof props.title=="string"? props.title : Object.values(props.title)[0]
    let {done, active, width, num}=props;
    return(
        <div className={classNames(css.item, {[css.done]:done, [css.active]:active})} style={{ width: width ? width : ''}}>
            <div className={css.title}>{title?title:`第${num}步`}</div>
            <div className={css.body}>
                <div className={css.num}>{props.num}</div>
                <div className={css.line}></div>
            </div>
        </div>
    )
}

export default function Stepper(props) {
	let {steps, width, current}=props;
	let findCurrentIdx=function(cur) {
		if (typeof steps[0]=='string') {
			return cur;
		}else{
			//return steps.findIndex(o=>o[cur])+1;
			for(let i=0;i<steps.length; i++) {
				var o=steps[i];
				if (cur in o) return i+1;
				
			}
			return 0;
		}
	}
	let sp_width= parseInt(100/steps.length)+'%';
	const curIdx=findCurrentIdx(current)
	return (<div style={{width:width, margin:"0 auto"}} >
		 { steps.map((s,i)=><Step key={i} num={i+1} title={s} width={sp_width} done={i<curIdx} active={i===curIdx-1} />) }
		</div>)
}
