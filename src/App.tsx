import '@/src/App.css';
import Container from '@/src/components/ui/containers/Container';
import { cn } from '@/src/utils/common/cn';
import type { ReactNode } from 'react';

interface IProps {
	children: ReactNode;
}

// MES의 App처럼 라우트가 전달한 화면을 감싸는 공통 틀입니다.
const App = ({ children }: IProps) => (
	<Container className={cn('mx-0 h-full min-w-0 flex-1')}>{children}</Container>
);

export default App;
