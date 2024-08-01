import {classNames} from './util.js'
import css from './input.module.scss'

export default function Select(props) {
	const {className, onChange, defaultValue, children, ...others}=props;
	return (
		<select 
			className={classNames(css.input, className)}	
			onChange={onChange} 
			defaultValue={defaultValue}
			{...others}
			>
			{children}
		</select>)
}
