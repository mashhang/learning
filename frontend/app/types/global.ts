// types/mathlive.d.ts
export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        ref?: React.Ref<any>;
        placeholder?: string;
        virtualKeyboardMode?: string;
        value?: string;
        class?: string;
      };
    }
  }
}
