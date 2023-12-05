import ReactJson from 'react-json-view';
import Text from '../Text';

const getCircularReplacer = () => {
	const seen = new WeakSet();
	return (key, value) => {
		if (typeof value === 'object' && value !== null) {
			if (seen.has(value)) {
				return;
			}
			seen.add(value);
		}
		return value;
	};
};

export const StateSliceDisplay = (props: { slice: any }) => {
	return (
		<Text.BODY1 className="text-[12px]">
			<ReactJson
				collapsed={1}
				src={JSON.parse(
					JSON.stringify(props.slice, getCircularReplacer()) || '{}'
				)}
			/>
		</Text.BODY1>
	);
};
