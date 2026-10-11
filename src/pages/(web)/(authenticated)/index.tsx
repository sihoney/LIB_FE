import SwitchTheme from '@/src/components/inputs/switchs/SwitchTheme';
import { createFileRoute, Link } from '@tanstack/react-router';

// TODO: MES처럼 시작 화면을 dashboard/index.tsx로 옮기고,
// appConfig와 guardAppRootRedirect를 연결하여 / → /dashboard로 이동하도록 변경합니다.
// 전환 시 시작 화면 링크도 정리합니다. 현재는 기존 / 화면을 임시로 유지합니다.
const Component = () => (
	<section>
		{/* TODO: MES의 공통 설정 UI를 연결할 때 테마 전환 위치를 맞춥니다.
      현재는 기존 테마 확인 기능을 임시 시작 화면에 보존합니다. */}
		<div className='mb-6 flex justify-end'>
			<SwitchTheme />
		</div>
		<h1>도서관 관리</h1>
		<p>도서 · 회원 · 대출 관리 화면을 준비하고 있습니다.</p>
		<Link to='/dev/notices'>테스트용 공지글 열기</Link>
	</section>
);

export const Route = createFileRoute('/(web)/(authenticated)/')({ component: Component });
