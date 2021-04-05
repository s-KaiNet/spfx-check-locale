import * as vs from 'vscode';
import { ExtensionName } from './consts';

class Logger {

  private outputChannel: vs.OutputChannel;

  private get channel() {
    if (!this.outputChannel) {
      this.outputChannel = vs.window.createOutputChannel(ExtensionName);
    }

    return this.outputChannel;
  }

  constructor(private context: vs.ExtensionContext) {
    context.subscriptions.push(this.channel)
  }


  public log(message: string) {
    this.format(message);
  }

  public error(message: string | Error | any, stackTrace?: string, details?: string) {

    this.format('****** ERROR *****');

    if (message instanceof Error) {
      this.format(`Message: ${message.message}`);
    } else if (typeof (message) === 'string') {
      this.format(`Message: ${message}`);
    } else {
      this.format(`Message: ${message.toString()}`);
    }

    if (message instanceof Error) {
      this.format(`Stack trace: ${message.stack}`);
    } else {
      if (stackTrace) {
        this.format(`Stack trace: ${stackTrace}`);
      }

      if (details) {
        this.format(`Details: ${details}`)
      }
    }

    this.format('******');
  }

  public format(message: string) {
    this.channel.appendLine(`[${new Date().toLocaleString()}] ${message}`);
  }
}

export function createLogger(context: vs.ExtensionContext) {
  return new Logger(context);
}