/**
 * @file index.js
 * @description This is the entry point for the library. This file exports all the necessary classes and functions.
 * @version 1.1.5
 *
 */
import Vader, { include, useRef } from './vader.js';
// @ts-ignore
import { VaderRouter } from './vaderRouter.js';
export { useRef, include, VaderRouter };
export default Vader;
