import { rememberPromise as test1 } from "https://esm.sh/remember-promise@2.0.4";
import { rememberPromise as test2 } from "jsr:@reda/remember-promise";
import { rememberPromise as test3 } from "npm:remember-promise";
import test4 from './.eslintrc.cjs';
import test5 from "./package.json" with { type: 'json' };

// eslint-disable-next-line @typescript-eslint/no-unused-expressions
test1; test2; test3; test4; test5;
