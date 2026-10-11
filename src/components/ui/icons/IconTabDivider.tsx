import BaseIcon, { type ISvgProps } from '@/src/components/ui/icons/BaseIcon';

const IconTabDivider = (props: ISvgProps) => (
	<BaseIcon {...props}>
		{/* 굵기는 소비처가 stroke-* 유틸로 지정 — non-scaling-stroke 라 아이콘 크기와 무관하게 px 단위로 적용 */}
		<line
			x1='12'
			y1='2'
			x2='12'
			y2='22'
			stroke='currentColor'
			strokeLinecap='round'
			vectorEffect='non-scaling-stroke'
		/>
	</BaseIcon>
);

export default IconTabDivider;
