import BaseIcon, { type ISvgProps } from '@/src/components/ui/icons/BaseIcon';

const IconTabCorner = (props: ISvgProps) => (
	<BaseIcon {...props}>
		<path d='M0 24C16 24 24 16 24 0H26V25H-1V24Z' fill='currentColor' />
		{/* 곡선 외곽선 — 소비처가 --tab-corner-stroke 변수로 색을 지정할 때만 표시.
		    transition 은 pill border(transition-colors 300ms)와 타이밍을 맞춘다 */}
		<path
			d='M0 24C16 24 24 16 24 0'
			fill='none'
			stroke='var(--tab-corner-stroke, transparent)'
			strokeWidth={1}
			vectorEffect='non-scaling-stroke'
			className='transition-[stroke] duration-300'
		/>
	</BaseIcon>
);

export default IconTabCorner;
