import { Link } from '@tanstack/react-router';

const NotFoundComponent = () => (
	<section className='app-status'>
		<h1>페이지를 찾을 수 없습니다</h1>
		<Link to='/'>시작 화면으로 이동</Link>
	</section>
);

export default NotFoundComponent;
