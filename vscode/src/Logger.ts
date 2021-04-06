import * as vs from 'vscode';
import { ExtensionDisplayName } from './consts';

class Logger implements vs.Disposable {

  private outputChannel: vs.OutputChannel;

  private get channel() {
    if (!this.outputChannel) {
      this.outputChannel = vs.window.createOutputChannel(ExtensionDisplayName);
    }

    return this.outputChannel;
  }

  dispose() {
    if (this.outputChannel) {
      this.outputChannel.dispose();
      this.outputChannel = null;
    }
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

  private format(message: string) {
    this.channel.appendLine(`[${new Date().toLocaleString()}] ${message}`);
  }
}

export const logger = new Logger();
