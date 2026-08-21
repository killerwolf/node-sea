import { Command } from 'commander';
import { sayHello } from './lib/greeter';

const program = new Command();

program
  .name('hello')
  .description('A simple greeting command')
  .argument('<name>', 'name to greet')
  .action((name: string) => {
    sayHello(name);
  });

program.parse();
