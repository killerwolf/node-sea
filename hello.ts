import { Command } from 'commander';
import { Greeter } from './lib/greeter';

const program = new Command();

program
  .name('hello')
  .description('A simple greeting command')
  .argument('<name>', 'name to greet')
  .action((name: string) => {
    Greeter.sayHello(name);
  });

program.parse();