import { PropsWithChildren } from "@kitajs/html";

export const BaseHtml = ({ children }: PropsWithChildren) => (
  <>
    {"<!DOCTYPE html>"}
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bethorday</title>
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css"
        />
        <link rel="stylesheet" href="/public/dist/unocss.css" />
      </ head>
      <body class="grid bg-slate-800 text-slate-100 place-items-center min-h-screen">
        {children}
      </body>
    </html >
  </>)
  ;
