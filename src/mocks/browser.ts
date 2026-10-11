import { setupWorker } from 'msw/browser';
import { handlers, resetMockDb } from './handlers';

resetMockDb();

export const worker = setupWorker(...handlers);
