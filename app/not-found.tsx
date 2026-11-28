import { SITE_NAME } from "../lib/site";

export default function NotFound() {
  return (
    <>
      <h1>not found</h1>
      <p>that page is not in this dataset.</p>
      <p>
        <a href="/">{SITE_NAME}</a>
      </p>
    </>
  );
}
