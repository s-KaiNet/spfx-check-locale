declare interface IHelloWorldWebPartStrings {
  Greeting: string;
}

declare module 'HelloWorldWebPartStrings' {
  const strings: IHelloWorldWebPartStrings;
  export = strings;
}
