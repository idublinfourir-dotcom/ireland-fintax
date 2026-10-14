import { Button, Container } from "./components/ui";
import { getT } from "./lib/messages";
import { aboutMessages } from "./lib/messages/about";

export default async function NotFound() {
  const t = (await getT(aboutMessages)).notFound;
  return (
    <section className="flex flex-1 items-center bg-canvas">
      <Container className="flex flex-col items-center gap-6 py-28 text-center">
        <p className="font-display text-7xl font-medium text-primary-500">404</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-balance text-ink sm:text-4xl">
          {t.title}
        </h1>
        <p className="max-w-md text-[15px] leading-7 text-muted">
          {t.body}
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button href="/">{t.home}</Button>
          <Button href="/contact" variant="outline">
            {t.contact}
          </Button>
        </div>
      </Container>
    </section>
  );
}
