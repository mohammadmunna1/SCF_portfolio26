import { LuArrowLeft } from "react-icons/lu";
import { MaskText } from "./ui/AnimatedText";
import { Button } from "./ui/Buttons";

const NotFound = () => (
  <section className="container-site flex min-h-[80svh] flex-col items-center justify-center py-32 text-center">
    <p aria-hidden="true" className="display text-display-hero text-heading/15">
      404
    </p>
    <MaskText as="h1" immediate text="Page not found" className="mt-4 text-[2rem] font-normal tracking-[-0.02em] text-heading md:text-[2.5rem]" />
    <p className="mt-5 max-w-md uppercase">The link may be broken or the page may have moved.</p>
    <Button to="/" leadingIcon={LuArrowLeft} className="mt-10">
      Back home
    </Button>
  </section>
);

export default NotFound;
