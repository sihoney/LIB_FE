import Close from '@mui/icons-material/Close';
import NavigateNext from '@mui/icons-material/NavigateNext';
import DeleteSweep from '@mui/icons-material/DeleteSweep';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';

// MES의 이름 기반 아이콘 매핑에서 현재 사용하는 아이콘만 등록합니다.
export const ICONS = {
	close: Close,
	navigateNext: NavigateNext,
	deleteAll: DeleteSweep,
	chevronLeft: ChevronLeft,
	chevronRight: ChevronRight,
} as const;

export type TIconName = keyof typeof ICONS; // type TIconName = 'chevronLeft' | 'chevronRight';
