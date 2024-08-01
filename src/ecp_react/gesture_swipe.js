/**
 * 功能提供Swipe Gesture 提供滑动手势处理
 * 检测到滑动后调用： this.props.onSwipe(g).
 * g.direction为滑动的方向
 */
import React from 'react';

const privateProps = {
	children: true,
	direction: true,
};

class GestureSwipe extends React.Component {

		static propTypes = {
		};

		static defaultProps = {
			direction : 'horizontal',
			threshold : 50,
		};
		
		state= {
			touching : false,
			touchId  : undefined,
			moveX     :  0,
			moveY     :  0,
			beginX    :  0,
			beginY    :  0,
		}

		handleTouchStart=(e)=>{
			if (this.state.touching) return;

			let beginX = e.targetTouches[0].pageX - this.state.moveX;
			let beginY = e.targetTouches[0].pageY - this.state.moveY;
			
			this.setState({
				touching: true,
				touchId: e.targetTouches[0].identifier,
				moveX : 0,
				moveY : 0,
				beginX,
				beginY,
			});
		}

		handleTouchMove=(e)=>{

				if (!this.state.touching) return;
				if (e.targetTouches[0].identifier !== this.state.touchId) return;
				//prevent move background
				//e.preventDefault();
				
				let moveX = this.state.moveX;
				let moveY = this.state.moveY;
				
				moveX = e.targetTouches[0].pageX - this.state.beginX;
				moveY = e.targetTouches[0].pageY - this.state.beginY;
								
				this.setState({	moveX, moveY});
		}

		handleTouchEnd=(e)=>{
				if (!this.state.touching) return;
				
				const {moveX, moveY, beginX, beginY}=this.state;
				
				let move=0, dir='h';
				
				if (Math.abs(moveX) > Math.abs(moveY)) {
					move=moveX;
					dir='h';
				}else{
					move=moveY;
					dir='v';
				}
				
				if ( Math.abs(move) >= this.props.threshold ) {
					let o={}
					if (move>0) o.direction= dir=== 'h'?4:3;
					else o.direction= dir === 'h'?2:1;
					if (this.props.onSwipe) this.props.onSwipe(o);	
				}

				this.setState({
				    touching: false,
				    beginX   : beginX+moveX,
						beginY   : beginY+moveY,
				    moveX    : 0,
						moveY    : 0,
				    touchId: undefined,
				});
		}

		render() {
			
			var props = {};
			
			Object.keys(this.props).forEach((key)=>{
				if (!privateProps[key]) {
					props[key] = this.props[key];
				}
			});
			props.onTouchStart=this.handleTouchStart;
			props.onTouchMove=this.handleTouchMove;
			props.onTouchEnd=this.handleTouchEnd;

			// Reuse the child provided
			// This makes it flexible to use whatever element is wanted (div, ul, etc)
			return React.cloneElement(React.Children.only(this.props.children), props);
		}
}

export default GestureSwipe;
