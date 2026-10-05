// 문서 골격 — App 의 h-full 체인(html → body → #root)과 가로 넘침 차단.
// 스크롤 컨테이너는 window(뷰포트)다. overflow-x 를 html 에만 두면 뷰포트로 전달돼 가로 넘침만 막고,
// body/#root 에 두면 스펙상 overflow-y 가 auto 로 바뀌어 #root 가 스크롤을 가로채므로 두지 않는다
// (TanStack Router 의 scroll-to-top·스크롤 복원은 window 기준이다).
// 배경색은 html 한 곳에만 둔다 — 루트 요소 배경은 캔버스 전체에 칠해져 #root(100% 높이) 밖으로 넘친 스크롤 영역까지 덮는다.
// CssBaseline 이 body 에 칠하는 background.default(#fff)는 투명으로 지운다 — 남겨두면 body(100% 높이)만 흰색이 돼
// 첫 화면과 스크롤한 아래쪽 색이 갈라진다.
export const documentStyles = {
	'html, body, #root': {
		height: '100%',
	},
	html: {
		overflowX: 'hidden',
		backgroundColor: 'var(--body-bg)',
	},
	body: {
		backgroundColor: 'transparent',
	},
	// 전역 스크롤바 — 보이는 두께는 8px, 실제 클릭·드래그 영역은 16px
	// (투명 border 로 여백을 만들고 background-clip: content-box 로 배경을 안쪽에만 그린다)
	'::-webkit-scrollbar': {
		width: 16,
		height: 16,
	},
	// 트랙은 썸 색을 흐릿하게 파생시켜 은은하게 깔아둔다
	'::-webkit-scrollbar-track': {
		backgroundColor: 'color-mix(in srgb, var(--scrollbar-thumb) 15%, transparent)',
		border: '5px solid transparent',
		backgroundClip: 'content-box',
		borderRadius: 999,
	},
	'::-webkit-scrollbar-thumb': {
		backgroundColor: 'var(--scrollbar-thumb)',
		border: '5px solid transparent',
		backgroundClip: 'content-box',
		borderRadius: 999,
	},
	'::-webkit-scrollbar-thumb:hover': {
		backgroundColor: 'var(--scrollbar-thumb-hover)',
	},
};
