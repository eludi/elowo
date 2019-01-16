# FAQ

#### Is the elowo API stable?

- Elowo is still a young project and there are plenty of ideas how it will evolve in the future.
  While we therefore cannot give you a guarantee that there won't ever be any incompatible changes,
  we have done our best to make the current API future-proof. If there will be a need for an
  incompatible change, we will clearly communicate it and most probably only trivial changes will be
  required to your code.

#### How can I report an issue

- Please use [Github issue tracking](https://github.com/eludi/elowo/issues) for this.

#### Which browsers are supported?

- Elowo relies on APIs that have only recently been added to the living HTML5 standard
  (e.g, service workers, cache API). Due to that, the browser needs to be fairly modern.
  Elowo is regularly tested on the most recent versions of Mozilla Firefox, Google Chrome
  (desktop and mobile), Microsoft Edge, Web/Epiphany, and Apple Mobile Safari.

#### What about Mac support?

- We test on Web/Epiphany (which uses the same WebKit browser engine as Safari) and iOS Mobile Safari,
  so we hope to indirectly cover maybe 98 percent of macOS Safari as well.
  But we do not own a Mac, so unfortunately we cannot regularly test elowo on it. So if you encounter
  issues (most probably when using the Safari browser), please report them to us, ideally with
  a suggestion how to fix them. In the meanwhile please try a different browser such as Firefox or
  Chrome.

#### Is elowo a retro computing project?

- No. We use the term "home computer" in our profile to capture certain essential qualities that
  elowo shares with home computers such as the Commodore C64 or Amstrad CPC:
  Immediate programmability and beginner friendliness.

- On a technical level, elowo is not retro at all but very modern, using many modern web
  technologies such as service workers or the caching API. Furthermore, elowo addresses the challenges of current frontend software development such as
  - support of heterogeneous platforms / various operating systems,
  - a presentation that supports a wide range of device formats,
  - resolution independent crisp canvas-based vector graphics, and
  - multi-modal pointer input (mouse, touch, stylus).
 
### How does elowo compare to [electron.js](https://electronjs.org/)?

- Both elowo and electron allow you to develop platform independent apps based on web technologies
  with Javascript as core language. Whereas the electron framework is a comprehensive runtime
  environment for professional-grade standalone desktop application development, elowo is a much more lightweight browser app that focuses on beginner-friendly personal coding. Furthermore, elowo
  provides a built-in basic code editor and even allows you to write and run code on smartphones and
  tablets. 

#### Shouldn't a beginner rather start with learning Python?

- Python is a versatile and beginner-friendly programing language that is definitely a good choice
  when starting with learning to code. Yet it has some weaknesses regarding its multimedia capabilities and requires expert-grade knowledge when a project nears its completion
  and shall be shared with others: It is non-trivial to package a python app in such a way that a
  non-technical user can execute it on her computer without installing a development environment
  first. Second, Python primarily addresses classic desktop operating systems (Windows, macOS, Linux),
  whereas the nowadays more widespread mobile platforms Android and iOS are at best afterthoughts.
  Both fundamental issues do not exist for elowo or the web as platform in general, and contemporary 
  JavaScript is a mature and approachable programing language as well.

#### What does elowo mean?

  - The name is a fictive Pidgin derivation from elowo < *helloworld. This is the classic name
    of the introductory first textbook example when learning a new programing language.
