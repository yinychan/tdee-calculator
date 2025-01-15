import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer, useActionData, Meta, Form, ScrollRestoration, Scripts } from "@remix-run/react";
import * as isbotModule from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import Anthropic from "@anthropic-ai/sdk";
import * as React from "react";
import { useState, useEffect } from "react";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PartyPopper } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";
import classNames from "classnames";
const ABORT_DELAY = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, remixContext, loadContext) {
  let prohibitOutOfOrderStreaming = isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;
  return prohibitOutOfOrderStreaming ? handleBotRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  ) : handleBrowserRequest(
    request,
    responseStatusCode,
    responseHeaders,
    remixContext
  );
}
function isBotRequest(userAgent) {
  if (!userAgent) {
    return false;
  }
  if ("isbot" in isbotModule && typeof isbotModule.isbot === "function") {
    return isbotModule.isbot(userAgent);
  }
  if ("default" in isbotModule && typeof isbotModule.default === "function") {
    return isbotModule.default(userAgent);
  }
  return false;
}
function handleBotRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onAllReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
function handleBrowserRequest(request, responseStatusCode, responseHeaders, remixContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(
        RemixServer,
        {
          context: remixContext,
          url: request.url,
          abortDelay: ABORT_DELAY
        }
      ),
      {
        onShellReady() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, ABORT_DELAY);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest
}, Symbol.toStringTag, { value: "Module" }));
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const alertVariants = cva(
  "tw-relative tw-w-full tw-rounded-lg tw-border tw-px-4 tw-py-3 tw-text-sm [&>svg+div]:tw-translate-y-[-3px] [&>svg]:tw-absolute [&>svg]:tw-left-4 [&>svg]:tw-top-4 [&>svg]:tw-text-foreground [&>svg~*]:tw-pl-7",
  {
    variants: {
      variant: {
        default: "tw-bg-background tw-text-foreground",
        destructive: "tw-border-destructive/50 tw-text-destructive dark:tw-border-destructive [&>svg]:tw-text-destructive"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Alert = React.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    role: "alert",
    className: cn(alertVariants({ variant }), className),
    ...props
  }
));
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "h5",
  {
    ref,
    className: cn("tw-mb-1 tw-font-medium tw-leading-none tw-tracking-tight", className),
    ...props
  }
));
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "div",
  {
    ref,
    className: cn("tw-text-sm [&_p]:tw-leading-relaxed", className),
    ...props
  }
));
AlertDescription.displayName = "AlertDescription";
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const useDesktop = (breakpoint = 1024) => {
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    setIsDesktop(window.innerWidth >= breakpoint);
    function handleResize() {
      setIsDesktop(window.innerWidth >= breakpoint);
    }
    window.addEventListener("resize", handleResize);
    return (_) => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isDesktop, breakpoint]);
  return isDesktop;
};
const main = "_main_h75o0_20";
const popout = "_popout_h75o0_552";
const wrapper = "_wrapper_h75o0_567";
const styles = {
  main,
  "black-on-white": "_black-on-white_h75o0_55",
  "black-on-off-white": "_black-on-off-white_h75o0_74",
  "white-on-black": "_white-on-black_h75o0_93",
  "white-on-green": "_white-on-green_h75o0_119",
  "white-on-dark-green": "_white-on-dark-green_h75o0_145",
  "green-on-white": "_green-on-white_h75o0_174",
  "green-on-off-white": "_green-on-off-white_h75o0_193",
  "white-on-dark-orange": "_white-on-dark-orange_h75o0_212",
  "orange-on-white": "_orange-on-white_h75o0_241",
  "orange-on-off-white": "_orange-on-off-white_h75o0_260",
  "white-on-orange": "_white-on-orange_h75o0_279",
  "white-on-dark-yellow": "_white-on-dark-yellow_h75o0_305",
  "yellow-on-white": "_yellow-on-white_h75o0_334",
  "yellow-on-off-white": "_yellow-on-off-white_h75o0_353",
  "white-on-yellow": "_white-on-yellow_h75o0_372",
  "white-and-brown-on-black": "_white-and-brown-on-black_h75o0_398",
  "brown-on-white": "_brown-on-white_h75o0_427",
  "white-on-dark-pink": "_white-on-dark-pink_h75o0_446",
  "white-on-pink": "_white-on-pink_h75o0_475",
  "pink-on-white": "_pink-on-white_h75o0_501",
  "pink-on-off-white": "_pink-on-off-white_h75o0_520",
  "content-center": "_content-center_h75o0_540",
  "container-center": "_container-center_h75o0_545",
  popout,
  wrapper,
  "wrapper--370": "_wrapper--370_h75o0_571",
  "wrapper--500": "_wrapper--500_h75o0_574",
  "wrapper--600": "_wrapper--600_h75o0_577",
  "wrapper--800": "_wrapper--800_h75o0_580",
  "wrapper--1200": "_wrapper--1200_h75o0_583"
};
function Container({
  className,
  children,
  element = "section",
  theme,
  type,
  align,
  justify,
  spacing,
  wrapper: wrapper2 = type === "popout" ? 1200 : null,
  ...props
}) {
  const HTMLElement = element;
  const isDesktop = useDesktop();
  return /* @__PURE__ */ jsx(
    HTMLElement,
    {
      className: classNames(
        !spacing && styles.main,
        className,
        type && styles[type],
        justify && styles["content-" + justify],
        align && styles["container-" + align],
        theme && styles[theme]
      ),
      ...props,
      children: isDesktop && wrapper2 ? /* @__PURE__ */ jsx("div", { className: classNames(styles.wrapper, styles[`wrapper--${wrapper2}`]), children }) : /* @__PURE__ */ jsx(Fragment, { children })
    }
  );
}
function TaskItem({ text }) {
  return /* @__PURE__ */ jsxs("li", { children: [
    /* @__PURE__ */ jsx(Button, { type: "button", children: "Begin task" }),
    /* @__PURE__ */ jsx(Button, { type: "button", children: "Done" }),
    /* @__PURE__ */ jsxs(Alert, { children: [
      /* @__PURE__ */ jsx(PartyPopper, { className: "h-4 w-4" }),
      /* @__PURE__ */ jsx(AlertTitle, { children: "Complete!" }),
      /* @__PURE__ */ jsx(AlertDescription, { children: "2 more points in the bank!" })
    ] }),
    /* @__PURE__ */ jsx("span", { children: text })
  ] });
}
async function action({ request }) {
  const formData = await request.formData();
  const query = formData.get("q");
  const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
  });
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1e3,
    messages: [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": `You are a productivity expert tasked with creating a structured, time-bound process for a given topic or task. Your goal is to break down the topic into a manageable 3-task process, with each task designed to take approximately 3 minutes to complete.

Here is the topic you need to create a process for:

<topic>
${query}
</topic>

Please follow these steps to create the 3-task process:

1. Analyze the given topic and consider how it can be broken down into three logical, sequential steps.

2. Ensure that each task you create can reasonably be completed in about 3 minutes.

3. Format your output as an HTML unordered list, with each task as a separate list item.

 Example output structure:

<output>
<ul>
  <li>[First 3-minute task]</li>
  <li>[Second 3-minute task]</li>
  <li>[Third 3-minute task]</li>
</ul>
</output>`
          }
        ]
      }
    ]
  });
  return { success: true, task: message.content[0].text };
}
function App() {
  const actionData = useActionData();
  const renderTasks = () => {
    if (!(actionData == null ? void 0 : actionData.task)) return null;
    const tasksList = actionData.task.match(/<li>(.*?)<\/li>/g) || [];
    const tasks = tasksList.map((task) => {
      const text = task.replace(/<\/?li>/g, "").trim();
      return /* @__PURE__ */ jsx(TaskItem, { text }, text);
    });
    return /* @__PURE__ */ jsx("ul", { children: tasks });
  };
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
      /* @__PURE__ */ jsx(
        "meta",
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1"
        }
      ),
      /* @__PURE__ */ jsx(Meta, {})
    ] }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsxs(Container, { element: "div", className: "wrapper", children: [
        /* @__PURE__ */ jsx("h1", { children: "Task Initiator" }),
        /* @__PURE__ */ jsx(Container, { children: /* @__PURE__ */ jsxs(Form, { id: "task-form", role: "search", method: "post", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              "aria-label": "Search contacts",
              id: "q",
              name: "q",
              placeholder: "I need to...",
              type: "search"
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              "aria-hidden": true,
              hidden: true,
              id: "search-spinner"
            }
          ),
          /* @__PURE__ */ jsx(Button, { type: "submit", children: "Start 3-minute task" })
        ] }) }),
        (actionData == null ? void 0 : actionData.task) && /* @__PURE__ */ jsxs(Container, { className: "mt-8", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold mb-4", children: "Your 3-Minute Task:" }),
          renderTasks()
        ] })
      ] }),
      /* @__PURE__ */ jsx(ScrollRestoration, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action,
  default: App
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-n0k5mwDV.js", "imports": ["/assets/components-ChtJfoGz.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": true, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasErrorBoundary": false, "module": "/assets/root-Ca14VNLH.js", "imports": ["/assets/components-ChtJfoGz.js"], "css": ["/assets/root-DC7gJM3O.css"] } }, "url": "/assets/manifest-c4f95695.js", "version": "c4f95695" };
const mode = "production";
const assetsBuildDirectory = "build/client";
const basename = "/";
const future = { "v3_fetcherPersist": false, "v3_relativeSplatPath": false, "v3_throwAbortReason": false, "v3_singleFetch": false, "v3_lazyRouteDiscovery": false, "unstable_optimizeDeps": false, "unstable_routeConfig": false };
const isSpaMode = false;
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  mode,
  publicPath,
  routes
};
