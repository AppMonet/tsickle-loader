import postscribe from "postscribe";

export default function loadHtml (): void {
  postscribe(document.body, "hello");
}