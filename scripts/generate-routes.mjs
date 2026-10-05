import { Generator, getConfig } from '@tanstack/router-generator';
import { fileURLToPath } from 'node:url';

// Vite 실행 전에도 같은 tsr.config.json으로 생성하여 새 checkout의 타입 검사를 지원합니다.
const root = fileURLToPath(new URL('..', import.meta.url));
const generator = new Generator({ config: getConfig({}, root), root });
await generator.run();
