import { createFileRoute, Link } from '@tanstack/react-router';

const Component = () => (
	<section>
		<h1>도서관 관리</h1>
		<p>도서 · 회원 · 대출 관리 화면을 준비하고 있습니다.</p>
		<Link to='/dev/notices' search={{ scenario: 'success' }}>
			테스트용 공지글 열기
		</Link>
	</section>
);

export const Route = createFileRoute('/')({ component: Component });
