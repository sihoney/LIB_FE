import '@/src/App.css';
import SwitchTheme from '@/src/components/inputs/switchs/SwitchTheme';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

interface IProps {
	children: ReactNode;
}

// MES의 App처럼 라우트가 전달한 화면을 감싸는 공통 틀입니다.
const App = ({ children }: IProps) => (
	<main className='app-home'>
		<nav className='actions' aria-label='기본 메뉴'>
			<Link to='/'>LIB 시작 화면</Link>
			<Link to='/dev/notices' search={{ scenario: 'success' }}>
				공지글
			</Link>
		</nav>
		<div className='mb-6 flex justify-end'>
			<SwitchTheme />
		</div>
		{children}
	</main>
);

export default App;
