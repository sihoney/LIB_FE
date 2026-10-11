import '@tanstack/react-router';

declare module '@tanstack/react-router' {
	interface StaticDataRouteOption {
		title?: string;
		pageBehaviorOptions?: { discardOnLeave?: boolean };
	}
}

// 라우트에 추가한 `staticData.title`과 `discardOnLeave`의 타입을 봅니다.
// '탭 제목'과 '페이지를 떠날 때의 처리 방식'을 지정하기 위한 정보

// .ts: 실행 코드와 타입을 작성할 수 있는 파일
// .d.ts: 타입을 설명하는 선언을 작성하는 파일

// .d.ts
// - 이 파일 자체가 브라우저에서 실행되어 탭을 만들거나 설정을 변경하지는 않습니다.
// - TypeScirpt가 코드의 타입을 검사하고, 편집기가 자동완성을 제공할 때 사용

// declare module
// - 기존 모듈의 타입 선언을 확장, 모듈 보강(module augmentation)
// - 'StaticDataRouteOption 인터페이스에 title이라는 선택 항목도 있다고 취급하라.
