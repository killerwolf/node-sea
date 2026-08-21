import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Greeter } from './greeter';

test('sayHello prints a greeting with the given name', () => {
  const lines: string[] = [];
  const originalLog = console.log;
  console.log = (line: string) => lines.push(line);

  try {
    Greeter.sayHello('World');
  } finally {
    console.log = originalLog;
  }

  assert.equal(lines.length, 1);
  assert.equal(lines[0], 'Hello, World!');
});

test('sayHello reflects the name back verbatim', () => {
  const lines: string[] = [];
  const originalLog = console.log;
  console.log = (line: string) => lines.push(line);

  try {
    Greeter.sayHello('Node 26');
  } finally {
    console.log = originalLog;
  }

  assert.equal(lines[0], 'Hello, Node 26!');
});
