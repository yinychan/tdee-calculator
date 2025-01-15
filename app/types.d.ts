declare module "*.css?url" {
  const url: string;
  export default url;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}