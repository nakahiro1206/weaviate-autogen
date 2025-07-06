import { procedure, router } from "../server";

export const helloRouter = router({
    hello: procedure.query(async () => {
        return "Hello, world!";
    }),
});