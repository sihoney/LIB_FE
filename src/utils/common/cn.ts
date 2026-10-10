import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * className 와 tailwind-merge 결합
 * - clsx: 여러 문자열과 조건부 클래스를 하나의 문자열로 합침
 * - twMerge: 서로 충돌하는 Tailwind 클래스를 정리
 */
export const cn = (...v: ClassValue[]) => twMerge(clsx(...v));
