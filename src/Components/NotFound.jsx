import { LuArrowLeft } from "react-icons/lu";
import { Button } from "./ui/Buttons";

const NotFound = () => (
  <section className="container-site flex min-h-[80svh] flex-col items-center justify-center py-32 text-center">
    <p className="eyebrow">Error 404</p>
    <h1 className="display mt-4 text-display-lg">Page not found</h1>
    <p className="copy mt-5 max-w-md">The link may be broken or the page may have moved.</p>
    <Button to="/" variant="primary" leadingIcon={LuArrowLeft} className="mt-10">
      Back home
    </Button>
  </section>
);

export default NotFound;
