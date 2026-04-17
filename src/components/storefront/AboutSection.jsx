export default function AboutSection({ content }) {
  const { heading, description, image } = content || {};

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-2xl px-6">
        {image && (
          <div className="mb-7 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-secondary shadow-sm ring-1 ring-black/5">
            <img
              src={image}
              alt={heading}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        {heading && (
          <h2 className="font-display text-[28px] font-extrabold leading-[1.1] tracking-tight sm:text-3xl">
            {heading}
          </h2>
        )}
        {description && (
          <p className="mt-4 text-[15px] leading-[1.7] text-foreground/75">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
