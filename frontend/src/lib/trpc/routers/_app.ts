import { router } from '../server';
import { paperRouter } from './paper';
import { helloRouter } from './hello';
import { pdfRouter } from './pdf';

export const appRouter = router({
  hello: helloRouter,
  paper: paperRouter,
  pdf: pdfRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;