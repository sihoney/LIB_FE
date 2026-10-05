import { ENV_DEV_MODE } from '@/src/consts/common/envKeys';
import { queryClient } from '@/src/contexts/QueryProvider';
import { Link, type ErrorComponentProps } from '@tanstack/react-router';

const ErrorComponent = ({ error, reset }: ErrorComponentProps) => {
	const handleRetry = () => {
		// MES처럼 실패한 Query 상태와 Router의 오류 상태를 함께 초기화합니다.
		void queryClient.resetQueries();
		reset();
	};

	return (
		<section className='app-status' role='alert'>
			<h1>오류가 발생했습니다</h1>
			<p>잠시 후 다시 시도해 주세요.</p>
			{ENV_DEV_MODE && (
				<p>{error instanceof Error ? error.message : '알 수 없는 오류입니다.'}</p>
			)}
			<div className='actions'>
				<button type='button' onClick={handleRetry}>
					다시 시도
				</button>
				<Link to='/'>시작 화면</Link>
			</div>
		</section>
	);
};

export default ErrorComponent;
