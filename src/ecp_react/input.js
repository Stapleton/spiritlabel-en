import {classNames} from './util.js'
import css from './input.module.scss'

export default function Input(props) {
	const {className, onChange, defaultValue, ...others}=props;
	return (
		<input
			className={classNames(css.input, className)}	
			onChange={onChange} 
			defaultValue={defaultValue}
			{...others}
		/>)
}
