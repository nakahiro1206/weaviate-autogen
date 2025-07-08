import { httpBatchLink, httpLink, isNonJsonSerializable, splitLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from './routers/_app';

const NODE_ENV = process.env.NODE_ENV;

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';
  if (process.env.VERCEL_URL)
    // reference for vercel deployment
    return `https://${process.env.VERCEL_URL}`;
  if (NODE_ENV === "development") {
    // assumes launched by `npm run dev`
    return `localhost:${process.env.PORT ?? 3000}`
  }
  // assume docker compose
  return `http://host.docker.internal:${process.env.PORT ?? 3000}`;
}
export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    return {
      links: [
        splitLink({
          condition: (opts) => isNonJsonSerializable(opts.input),
          true: httpLink({ // for form data
            url: `${getBaseUrl()}/api/trpc`,
          }),
          false: httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
          }),
        }),
        // httpBatchLink({
        //   /**
        //    * If you want to use SSR, you need to use the server's full URL
        //    * @see https://trpc.io/docs/v11/ssr
        //    **/
        //   url: `${getBaseUrl()}/api/trpc`,
        //   // You can pass any HTTP headers you wish here
        //   async headers() {
        //     return {
        //       // authorization: getAuthCookie(),
        //     };
        //   },
        // }),
        
      ],
    };
  },
  /**
   * @see https://trpc.io/docs/v11/ssr
   **/
  ssr: false,
});