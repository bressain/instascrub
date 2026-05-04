import CSS from "./styles.css?inline";

export function injectStyles(): void {
  if (document.getElementById("instascrub-styles")) return;
  const style = document.createElement("style");
  style.id = "instascrub-styles";
  style.textContent = CSS;
  document.head.appendChild(style);
}
