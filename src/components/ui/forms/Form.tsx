import type { FormHTMLAttributes } from 'react';

interface IProps extends FormHTMLAttributes<HTMLFormElement> {}

// - HTML 기본 검증을 끄고
// - 제출 이벤트만 전달합니다.
// - 폼 값, Zod 규칙, 저장 mutation은 업무 모달이 계속 담당합니다.

// MES_FE와 같이 브라우저 기본 검증을 끄고, react-hook-form의 검증 흐름에 맡깁니다.
const Form = ({ onSubmit, ...props }: IProps) => (
	<form
		noValidate
		{...props}
		onSubmit={event => {
			event.preventDefault();
			onSubmit?.(event);
		}}
	/>
);

export default Form;
