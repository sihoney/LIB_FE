import { merge } from 'es-toolkit';

// es-toolkit merge 는 첫 인자를 in-place 변형
// 		→ 빈 객체에 base 를 깊은 복사한 뒤 overrides 병합(비변형)
export const deepMerge = <T extends object>(base: T, overrides: object): T =>
	merge(
		merge({} as Record<PropertyKey, unknown>, base as Record<PropertyKey, unknown>),
		overrides as Record<PropertyKey, unknown>,
	) as T;
