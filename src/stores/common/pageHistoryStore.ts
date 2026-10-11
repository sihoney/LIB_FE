import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const MAX_PAGE_HISTORY = 10;

// LIB는 WEB만 사용하므로 앱 유형별 저장소 분기는 아직 두지 않습니다.

export interface IPageHistoryItem {
	path: string;
	queryString: string;
	title: string;
	lastAccessedAt: number;
	routeTemplate?: string;
}

interface IRemoveResult {
	nextItem: IPageHistoryItem | null;
	wasActive: boolean;
}

type TPageHistoryUpsert = Omit<IPageHistoryItem, 'lastAccessedAt'>;

export interface IRemoveItemByPath {
	path: string;
	currentPath: string;
}

export interface IRemoveItemByGroupKey {
	groupKey: string;
	currentGroupKey: string;
}

// toGroupKey: 어떤 방문을 같은 탭으로 취급하는지
export const toGroupKey = (path: string, routeTemplate?: string): string => {
	const target = routeTemplate ?? path;
	const normalized = target.replace(/\/+$/, '');

	return normalized ? `${normalized}/` : '/';
};

interface IPageHistoryStore {
	items: IPageHistoryItem[];
	upsertItem: (item: TPageHistoryUpsert) => void;
	removeItem: (payload: IRemoveItemByPath | IRemoveItemByGroupKey) => IRemoveResult;
	removeOthers: (path: string, currentPath: string) => IRemoveResult;
	removeRight: (path: string, currentPath: string) => IRemoveResult;
	reorderItems: (fromIndex: number, toIndex: number) => void;
	clearItems: () => void;
	getLastVisitedByMenuPath: (menuPath: string) => IPageHistoryItem | null;
}

/**
 * LRU
 */
const evictOldest = (items: IPageHistoryItem[]): IPageHistoryItem[] => {
	if (items.length <= MAX_PAGE_HISTORY) return items;

	const target = items.slice(0, -1);
	let victimIdx = 0;

	for (let i = 1; i < target.length; i++) {
		if (target[i].lastAccessedAt < target[victimIdx].lastAccessedAt) {
			victimIdx = i;
		}
	}

	return items.filter((_, i) => i !== victimIdx);
};

const enforceLimit = (items: IPageHistoryItem[]): IPageHistoryItem[] => {
	if (items.length <= MAX_PAGE_HISTORY) return items;

	const survivors = new Set(
		[...items]
			.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)
			.slice(0, MAX_PAGE_HISTORY)
			.map(i => i.path),
	);

	return items.filter(i => survivors.has(i.path));
};

const usePageHistoryStore = create<IPageHistoryStore>()(
	persist(
		(set, get) => ({
			items: [],
			// upsertItem: 새 탭 추가 또는 기존 탭 갱신
			upsertItem: item => {
				set(state => {
					const now = Date.now();
					const groupKey = toGroupKey(item.path, item.routeTemplate);
					const firstIdx = state.items.findIndex(
						i => toGroupKey(i.path, i.routeTemplate) === groupKey,
					);

					if (firstIdx === -1) {
						const appended = [...state.items, { ...item, lastAccessedAt: now }];
						return { items: evictOldest(appended) };
					}

					const next = state.items.filter(
						(i, idx) =>
							idx === firstIdx || toGroupKey(i.path, i.routeTemplate) !== groupKey,
					);
					const targetIdx = next.findIndex(
						i => toGroupKey(i.path, i.routeTemplate) === groupKey,
					);
					next[targetIdx] = { ...next[targetIdx], ...item, lastAccessedAt: now };
					return { items: next };
				});
			},
			removeItem: payload => {
				const state = get();

				const isGroupKey = 'groupKey' in payload;
				const target = isGroupKey ? payload.groupKey : payload.path;
				const current = isGroupKey ? payload.currentGroupKey : payload.currentPath;

				const match = (item: IPageHistoryItem): boolean =>
					isGroupKey
						? toGroupKey(item.path, item.routeTemplate) === target
						: item.path === target;

				const idx = state.items.findIndex(match);
				if (idx === -1) return { nextItem: null, wasActive: false };

				const next = state.items.filter(i => !match(i));
				const wasActive = current === target;
				const nextItem = wasActive ? (next[Math.min(idx, next.length - 1)] ?? null) : null;

				set({ items: next });
				return { nextItem, wasActive };
			},
			removeOthers: (path, currentPath) => {
				const state = get();
				const target = state.items.find(i => i.path === path);
				if (!target) return { nextItem: null, wasActive: false };

				const wasActive = currentPath !== path;
				set({ items: [target] });
				return { nextItem: target, wasActive };
			},
			removeRight: (path, currentPath) => {
				const state = get();
				const idx = state.items.findIndex(i => i.path === path);
				if (idx === -1) return { nextItem: null, wasActive: false };

				const next = state.items.slice(0, idx + 1);
				const currentIdx = state.items.findIndex(i => i.path === currentPath);
				const wasActive = currentIdx > idx;
				const nextItem = wasActive ? next[idx] : null;

				set({ items: next });
				return { nextItem, wasActive };
			},
			reorderItems: (fromIndex, toIndex) => {
				if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

				const state = get();
				const next = [...state.items];
				const [moved] = next.splice(fromIndex, 1);

				next.splice(toIndex, 0, moved);
				set({ items: next });
			},
			clearItems: () => {
				set({ items: [] });
			},
			getLastVisitedByMenuPath: menuPath => {
				const prefix = menuPath.replace(/\/$/, '');
				if (!prefix) return null;

				return (
					get()
						.items.filter(item => {
							const path = item.path.replace(/\/$/, '');
							return path === prefix || path.startsWith(`${prefix}/`);
						})
						.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt)[0] ?? null
				);
			},
		}),
		{
			name: 'lib:web:page-history-store',
			version: 0,
			storage: createJSONStorage(() => sessionStorage),
			onRehydrateStorage: () => state => {
				if (state && state.items.length > MAX_PAGE_HISTORY)
					state.items = enforceLimit(state.items);
			},
		},
	),
);

export default usePageHistoryStore;
