import React from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

type SliderProps = {
	onDrop: (newVal: number | number[]) => any;
	onMove: (newVal: number | number[]) => any;
	step: number;
	value: number;
	disabled?: boolean;
	min?: number;
	max?: number;
};

const LeverageSlider = ({
	onDrop,
	onMove,
	step,
	value,
	disabled,
	min = 1,
	max = 5,
}: SliderProps) => {
	return (
		<div className="relative">
			<Slider
				min={min}
				max={max}
				value={value}
				onChange={(e) => {
					onMove(e);
				}}
				onAfterChange={(e) => {
					onDrop(e);
				}}
				step={step}
				disabled={disabled}
			/>
		</div>
	);
};

export default React.memo(LeverageSlider);
