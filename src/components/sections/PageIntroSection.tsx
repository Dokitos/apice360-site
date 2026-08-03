import { Reveal } from "@/components/ui/Reveal";

type PageIntroSectionProps = {
  eyebrow?: string | null;
  heading: string;
  body?: string | null;
  imageUrl?: string | null;
};

export function PageIntroSection({ eyebrow, heading, body, imageUrl }: PageIntroSectionProps) {
  return (
    <Reveal as="section" className="bg-surface-container-lowest py-32">
      <div className="mx-auto max-w-[1280px] px-5 text-center md:px-20">
        {eyebrow ? (
          <span className="mb-4 block font-mono text-label-mono uppercase tracking-widest text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mx-auto mb-6 max-w-3xl font-heading text-headline-lg">{heading}</h1>
        {body ? (
          <p className="mx-auto max-w-2xl text-body-lg leading-relaxed text-on-surface-variant">{body}</p>
        ) : null}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mx-auto mt-16 h-[360px] w-full max-w-4xl rounded-lg object-cover" />
        ) : null}
      </div>
    </Reveal>
  );
}
