export interface ProcessEnvObject {
  [key: string]: string | undefined;
}

export class ProcessEnvWrapper {
  private static _instance: ProcessEnvWrapper;
  private _overrides?: ProcessEnvObject;
  private readonly _processEnv: ProcessEnvObject;

  public static getInstance(): ProcessEnvWrapper {
    if (!this._instance) {
      this._instance = new ProcessEnvWrapper(process.env);
    }
    return this._instance;
  }

  public overrideEnv(overrides: ProcessEnvObject): void {
    this._overrides = overrides;
  }

  public clearOverrides(): void {
    this._overrides = undefined;
  }

  protected constructor(processEnv: ProcessEnvObject) {
    this._processEnv = processEnv;
    this._overrides = undefined;
  }

  public getValue(path: string): string | undefined {
    const environment = this._overrides || this._processEnv;

    return environment[path];
  }

  public getValueOrDefault(path: string, defaultValue: string): string {
    return this.getValue(path) || defaultValue;
  }

  public getValueOrThrow(path: string): string {
    if (!this.isEnabled(path)) {
      throw new Error(
        `process.env.${path} is not defined but is required for service to be healthy`
      );
    }
    return <string>this.getValue(path);
  }

  public isEnabled(path: string): boolean {
    const value = this.getValueOrDefault(path, 'false');
    return !!value && value !== 'false' && value !== 'off';
  }
}

const _instance = ProcessEnvWrapper.getInstance();
export default _instance;
