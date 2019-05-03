#!/usr/bin/env node
'use strict';

const USAGE = `USAGE:
$ cat files* | npx reservoir-sample-stdin NUMBER-OF-LINES
`;

/**
 * Apply reservoir sampling on an array: randomly sample a fixed number of
 * elements from an array, in such a way that new data can be incorporated.
 * Iterative usage example:
 * ```js
 * var reservoir = [];
 * var linesRead = 0;
 * var maxSize = 3;
 * [reservoir, linesRead] = reservoirSample(reservoir, linesRead, maxSize,
 *                                          [1, 2, 3, 4, 5]);
 * [reservoir, linesRead] = reservoirSample(reservoir, linesRead, maxSize,
 *                                          [10, 20, 30, 40, 50]);
 * console.log(reservoir);
 * ```
 *
 * @param {Array<string>} reservoir current reservoir
 * @param {number} linesRead number of lines read to achieve `reservoir`
 * @param {number} maxSize maximum size of `reservoir`
 * @param {Array<string>} lines new lines to evaluate
 * @returns {[Array<string>, number]} the new `reservoir` and `linesRead`.
 */
function reservoirSample(reservoir, linesRead, maxSize, lines) {
  for (const line of lines) {
    if ((++linesRead) <= maxSize) {
      reservoir.push(line);
    } else {
      if (Math.random() <= maxSize / linesRead) {
        const idx = Math.floor(Math.random() * maxSize);
        reservoir[idx] = line;
      }
    }
  }
  return [reservoir, linesRead];
}
module.export = reservoirSample;

if (module === require.main) {
  // Parse inputs
  const maxSize = parseInt(process.argv[2]);
  if (!maxSize) {
    console.error(USAGE);
    process.exit(1);
  }

  // Prepare stdin
  process.stdin.setEncoding('utf8');

  // Parse stdin
  let tailBuffer = '';
  let reservoir = [];
  let linesRead = 0;
  function processData(data) {
    const lines = (tailBuffer + data).split('\n');
    tailBuffer = lines.pop();
    [reservoir, linesRead] =
        reservoirSample(reservoir, linesRead, maxSize, lines);
  }
  process.stdin.on('data', processData);

  // Finalize trailing chunk of stdin and print reservoir
  process.stdin.on('end', () => {
    processData('');
    console.log(reservoir.join('\n'));
  });
}
