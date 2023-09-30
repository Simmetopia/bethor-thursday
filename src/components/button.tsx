import { PropsWithChildren } from "@kitajs/html";


// Slick slate gray button
export function Button({ children, ...props }: PropsWithChildren<JSX.HtmlButtonTag>) {
  return <button class="bg-slate-800 font-bold hover:bg-slate-600 text-stone-200 rounded px-6 py-3"  {...props}>{children}</button>;
}
