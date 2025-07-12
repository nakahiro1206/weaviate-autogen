import { httpBatchLink, httpLink, isNonJsonSerializable, splitLink, createWSClient, wsLink } from '@trpc/client';
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

const wsClient = createWSClient({
  url: `ws://localhost:3000`, // send to websocket proxy server.
  connectionParams: async () => ({
    token: 'supersecret',
  }),
});

export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    return {
      links: [
        splitLink({
          condition: (opts) => isNonJsonSerializable(opts.input),
          true: httpLink({ // for form data
            url: `${getBaseUrl()}/api/trpc`,
          }),
          false: splitLink({ // for subscription requests
            condition: (opts) => opts.type === "subscription",
            true: wsLink({
              client: wsClient,
            }),
            false: httpBatchLink({ // for normal requests
              url: `${getBaseUrl()}/api/trpc`,
            }),
          }),
        }),
      ],
    };
  },
  /**
   * @see https://trpc.io/docs/v11/ssr
   **/
  ssr: false,
});