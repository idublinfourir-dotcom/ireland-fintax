import { Button, Container } from "./components/ui";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center bg-canvas">
      <Container className="flex flex-col items-center gap-6 py-28 text-center">
        <p className="font-display text-7xl font-medium text-primary-500">404</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-ink sm:text-4xl">
          This field is empty.
        </h1>
        <p className="max-w-md text-[15px] leading-7 text-muted">
          The page you are looking for has been moved, harvested or never
          planted. Let’s get you back to solid ground.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button href="/">Back to home</Button>
          <Button href="/contact" variant="outline">
            Contact us
          </Button>
        </div>
      </Container>
    </section>
  );
}
