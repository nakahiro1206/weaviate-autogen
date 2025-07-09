import { router } from '../server';
import { paperRouter } from './paper';
import { helloRouter } from './hello';
import { pdfRouter } from './pdf';
import { chunkRouter } from './chunk';

export const appRouter = router({
  hello: helloRouter,
  paper: paperRouter,
  pdf: pdfRouter,
  chunk: chunkRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;